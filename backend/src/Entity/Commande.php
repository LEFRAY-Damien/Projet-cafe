<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Patch;
use App\Repository\CommandeRepository;
use App\State\CommandeProcessor;
use App\State\MeCommandesProvider;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Context\ExecutionContextInterface;

#[ApiResource(
    operations: [
        // =========================
        // ADMIN
        // =========================
        new GetCollection(
            uriTemplate: '/admin/commandes',
            security: "is_granted('ROLE_ADMIN')",
            normalizationContext: ['groups' => ['admin:commande:read']]
        ),
        new Get(
            uriTemplate: '/admin/commandes/{id}',
            security: "is_granted('ROLE_ADMIN')",
            normalizationContext: ['groups' => ['admin:commande:read']]
        ),
        new Delete(
            uriTemplate: '/admin/commandes/{id}',
            security: "is_granted('ROLE_ADMIN')"
        ),
        new Patch(
            uriTemplate: '/admin/commandes/{id}',
            security: "is_granted('ROLE_ADMIN')",
            denormalizationContext: ['groups' => ['admin:commande:write']],
            normalizationContext: ['groups' => ['admin:commande:read']]
        ),

        // =========================
        // USER / OWNER
        // =========================
        new Get(
            uriTemplate: '/commandes/{id}',
            security: "object.getUser() == user or is_granted('ROLE_ADMIN')",
            normalizationContext: ['groups' => ['commande:read']]
        ),

        new GetCollection(
            uriTemplate: '/me/commandes',
            security: "is_granted('ROLE_USER')",
            provider: MeCommandesProvider::class,
            normalizationContext: ['groups' => ['commande:read']]
        ),

        new GetCollection(
            security: "is_granted('ROLE_USER')"
        ),

        new Post(
            security: "is_granted('ROLE_USER')",
            output: false,
            processor: CommandeProcessor::class
        ),
    ],
    normalizationContext: ['groups' => ['commande:read']],
    denormalizationContext: ['groups' => ['commande:write']]
)]
#[ORM\Entity(repositoryClass: CommandeRepository::class)]
class Commande
{
    // ✅ Constantes de statuts
    public const STATUT_EN_ATTENTE = 'en_attente';
    public const STATUT_PRETE      = 'prete';
    public const STATUT_RETIREE    = 'retiree';
    public const STATUT_REFUSEE    = 'refusee';
    public const STATUT_ANNULEE    = 'annulee';

    #[ApiProperty(identifier: true)]
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['commande:read', 'admin:commande:read'])]
    private ?int $id = null;

    #[ORM\Column]
    #[Groups(['commande:read', 'admin:commande:read'])]
    private ?\DateTimeImmutable $dateCommande = null;

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    #[Groups(['commande:read', 'commande:write', 'admin:commande:read'])]
    private ?\DateTime $dateRetrait = null;

    #[ORM\Column(length: 30)]
    #[Groups(['commande:read', 'admin:commande:read', 'admin:commande:write'])]
    #[Assert\Choice(choices: [
        self::STATUT_EN_ATTENTE,
        self::STATUT_PRETE,
        self::STATUT_RETIREE,
        self::STATUT_REFUSEE,
        self::STATUT_ANNULEE,
    ])]
    private ?string $statut = null;

    #[ORM\ManyToOne(inversedBy: 'commandes')]
    #[ORM\JoinColumn(nullable: false)]
    // ✅ Visible uniquement en admin (pour afficher nom/email dans la liste)
    #[ApiProperty(readable: true, writable: false)]
    #[Groups(['admin:commande:read'])]
    private ?User $user = null;

    #[ORM\OneToMany(
        mappedBy: 'commande',
        targetEntity: CommandeLigne::class,
        cascade: ['persist', 'remove'],
        orphanRemoval: true
    )]
    #[Groups(['commande:read', 'commande:write', 'admin:commande:read'])]
    private Collection $lignes;

    public function __construct()
    {
        $this->lignes = new ArrayCollection();
        $this->dateCommande = new \DateTimeImmutable();
        $this->statut = self::STATUT_EN_ATTENTE;
    }

    // =========================
    // VALIDATION
    // =========================
    #[Assert\Callback]
    public function validateDateRetrait(ExecutionContextInterface $context): void
    {
        if (!$this->dateRetrait) {
            $context->buildViolation('Choisis une date de retrait.')
                ->atPath('dateRetrait')
                ->addViolation();
            return;
        }

        $min = (new \DateTime('today'))->modify('+1 day');
        $max = (new \DateTime('today'))->modify('+7 days');

        if ($this->dateRetrait < $min) {
            $context->buildViolation('La date de retrait doit être au minimum le lendemain.')
                ->atPath('dateRetrait')
                ->addViolation();
        }

        if ($this->dateRetrait > $max) {
            $context->buildViolation('La date de retrait doit être dans les 7 prochains jours.')
                ->atPath('dateRetrait')
                ->addViolation();
        }
    }

    // =========================
    // GETTERS / SETTERS
    // =========================
    public function getId(): ?int
    {
        return $this->id;
    }

    public function getDateCommande(): ?\DateTimeImmutable
    {
        return $this->dateCommande;
    }

    public function setDateCommande(\DateTimeImmutable $dateCommande): static
    {
        $this->dateCommande = $dateCommande;
        return $this;
    }

    public function getDateRetrait(): ?\DateTime
    {
        return $this->dateRetrait;
    }

    public function setDateRetrait(?\DateTime $dateRetrait): static
    {
        $this->dateRetrait = $dateRetrait;
        return $this;
    }

    public function getStatut(): ?string
    {
        return $this->statut;
    }

    public function setStatut(string $statut): static
    {
        $this->statut = $statut;
        return $this;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;
        return $this;
    }

    /**
     * @return Collection<int, CommandeLigne>
     */
    public function getLignes(): Collection
    {
        return $this->lignes;
    }

    public function addLigne(CommandeLigne $ligne): static
    {
        if (!$this->lignes->contains($ligne)) {
            $this->lignes->add($ligne);
            $ligne->setCommande($this);
        }
        return $this;
    }

    public function removeLigne(CommandeLigne $ligne): static
    {
        if ($this->lignes->removeElement($ligne)) {
            if ($ligne->getCommande() === $this) {
                $ligne->setCommande(null);
            }
        }
        return $this;
    }

    // =========================
    // LOGIQUE METIER (soft delete user)
    // =========================
    public function isTerminee(): bool
    {
        return in_array($this->statut, [
            self::STATUT_RETIREE,
            self::STATUT_REFUSEE,
            self::STATUT_ANNULEE,
        ], true);
    }

    public function annulerSiNonTerminee(): void
    {
        if (!$this->isTerminee()) {
            $this->statut = self::STATUT_ANNULEE;
        }
    }
}
