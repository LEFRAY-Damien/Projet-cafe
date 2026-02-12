<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Post;
use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Serializer\Attribute\Groups;

#[ApiResource(
    operations: [
        // ✅ Inscription publique
        new Post(
            uriTemplate: '/register',
            security: "is_granted('PUBLIC_ACCESS')",
            processor: \App\State\UserRegisterProcessor::class,
            denormalizationContext: ['groups' => ['user:write']],
            normalizationContext: ['groups' => ['user:read']]
        ),

        // ✅ Soft delete (admin OU utilisateur lui-même)
        new Delete(
            security: "is_granted('ROLE_ADMIN') or object == user",
            processor: \App\State\UserSoftDeleteProcessor::class
        ),

        // ✅ Admin only
        new GetCollection(security: "is_granted('ROLE_ADMIN')"),
        new Get(security: "is_granted('ROLE_ADMIN')"),
        new Put(security: "is_granted('ROLE_ADMIN')"),
        new Patch(security: "is_granted('ROLE_ADMIN') or object == user"),
    ],
    normalizationContext: ['groups' => ['user:read']],
    denormalizationContext: ['groups' => ['user:write']],
    forceEager: false
)]
#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\UniqueConstraint(name: 'UNIQ_IDENTIFIER_EMAIL', fields: ['email'])]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['user:read', 'admin:commande:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 180)]
    #[Groups(['user:read', 'user:write', 'admin:commande:read'])]
    private ?string $email = null;

    /**
     * @var list<string>
     */
    #[ORM\Column]
    #[Groups(['user:read', 'user:write', 'admin:commande:read'])]
    private array $roles = [];

    #[ORM\Column]
    private ?string $password = null;

    // mot de passe en clair (inscription uniquement)
    #[Groups(['user:write'])]
    private ?string $plainPassword = null;

    #[ORM\Column(length: 50)]
    #[Groups(['user:read', 'user:write', 'admin:commande:read'])]
    private ?string $nom = null;

    #[ORM\Column(length: 50)]
    #[Groups(['user:read', 'user:write', 'admin:commande:read'])]
    private ?string $prenom = null;

    #[ORM\Column(length: 50, nullable: true)]
    #[Groups(['user:read', 'user:write'])]
    private ?string $whatsapp = null;

    #[ORM\Column(options: ['default' => true])]
    #[Groups(['user:read', 'user:write', 'admin:commande:read'])]
    private bool $isActive = true;

    #[ORM\Column(nullable: true)]
    #[Groups(['user:read', 'admin:commande:read'])]
    private ?\DateTimeImmutable $deletedAt = null;

    /**
     * @var Collection<int, Produit>
     */
    #[ORM\ManyToMany(targetEntity: Produit::class, inversedBy: 'favoris')]
    #[Groups(['user:read'])]
    private Collection $favoris;

    /**
     * @var Collection<int, Commande>
     */
    #[ORM\OneToMany(mappedBy: 'user', targetEntity: Commande::class)]
    private Collection $commandes;

    public function __construct()
    {
        $this->isActive = true;
        $this->favoris = new ArrayCollection();
        $this->commandes = new ArrayCollection();
    }

    /* =======================
       GETTERS / SETTERS
       ======================= */

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;
        return $this;
    }

    public function getDeletedAt(): ?\DateTimeImmutable
    {
        return $this->deletedAt;
    }

    public function setDeletedAt(?\DateTimeImmutable $deletedAt): static
    {
        $this->deletedAt = $deletedAt;
        return $this;
    }

    public function isSoftDeleted(): bool
    {
        return $this->deletedAt !== null || $this->isActive === false;
    }

    public function clearFavoris(): void
    {
        foreach ($this->favoris as $produit) {
            $this->removeFavori($produit);
        }
    }

    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }

    public function getRoles(): array
    {
        $roles = $this->roles;
        $roles[] = 'ROLE_USER';
        return array_unique($roles);
    }

    public function setRoles(array $roles): static
    {
        $this->roles = $roles;
        return $this;
    }

    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;
        return $this;
    }

    public function getPlainPassword(): ?string
    {
        return $this->plainPassword;
    }

    public function setPlainPassword(?string $plainPassword): static
    {
        $this->plainPassword = $plainPassword;
        return $this;
    }

    public function __serialize(): array
    {
        $data = (array) $this;
        $data["\0" . self::class . "\0password"] = hash('crc32c', $this->password);
        return $data;
    }

    public function eraseCredentials(): void {}

    public function getNom(): ?string
    {
        return $this->nom;
    }

    public function setNom(string $nom): static
    {
        $this->nom = $nom;
        return $this;
    }

    public function getPrenom(): ?string
    {
        return $this->prenom;
    }

    public function setPrenom(string $prenom): static
    {
        $this->prenom = $prenom;
        return $this;
    }

    public function getWhatsapp(): ?string
    {
        return $this->whatsapp;
    }

    public function setWhatsapp(?string $whatsapp): static
    {
        $this->whatsapp = $whatsapp;
        return $this;
    }

    public function isActive(): bool
    {
        return $this->isActive;
    }

    public function setIsActive(bool $isActive): static
    {
        $this->isActive = $isActive;
        return $this;
    }

    /**
     * @return Collection<int, Produit>
     */
    public function getFavoris(): Collection
    {
        return $this->favoris;
    }

    public function addFavori(Produit $favori): static
    {
        if (!$this->favoris->contains($favori)) {
            $this->favoris->add($favori);
            $favori->addFavori($this);
        }
        return $this;
    }

    public function removeFavori(Produit $favori): static
    {
        if ($this->favoris->removeElement($favori)) {
            $favori->removeFavori($this);
        }
        return $this;
    }

    /**
     * @return Collection<int, Commande>
     */
    public function getCommandes(): Collection
    {
        return $this->commandes;
    }
}
