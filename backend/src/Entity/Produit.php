<?php

namespace App\Entity;

use App\Repository\ProduitRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;

use Symfony\Component\Serializer\Annotation\Groups;

#[ApiResource(
    operations: [
        new Get(),
        new GetCollection(),
        new Post(security: "is_granted('ROLE_ADMIN')"),
        new Put(security: "is_granted('ROLE_ADMIN')"),
        new Delete(security: "is_granted('ROLE_ADMIN')"),
    ],
    normalizationContext: ['groups' => ['produit:read']],
    denormalizationContext: ['groups' => ['produit:write']]
)]
#[ORM\Entity(repositoryClass: ProduitRepository::class)]
class Produit
{
    #[Groups(['produit:read'])]
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[Groups(['produit:read', 'produit:write'])]
    #[ORM\Column(length: 150)]
    private ?string $nom = null;

    #[Groups(['produit:read', 'produit:write'])]
    #[ORM\Column(type: Types::TEXT)]
    private ?string $description = null;

    #[Groups(['produit:read', 'produit:write'])]
    #[ORM\Column]
    private ?float $prix = null;

    #[Groups(['produit:read', 'produit:write'])]
    #[ORM\Column]
    private ?bool $disponible = null;

    #[Groups(['produit:read', 'produit:write'])]
    #[ORM\ManyToOne(inversedBy: 'produits')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Categorie $categorie = null;

    /**
     * @var Collection<int, Image>
     */
    #[Groups(['produit:read'])]
    #[ORM\OneToMany(mappedBy: 'produit', targetEntity: Image::class, cascade: ['persist', 'remove'], orphanRemoval: true)]
    private Collection $images;

    /**
     * @var Collection<int, User>
     */
    #[ORM\ManyToMany(targetEntity: User::class, mappedBy: 'favoris')]
    private Collection $favoris;

    public function __construct()
    {
        $this->disponible = true;
        $this->images = new ArrayCollection();
        $this->favoris = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNom(): ?string
    {
        return $this->nom;
    }

    public function setNom(string $nom): static
    {
        $this->nom = $nom;
        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(string $description): static
    {
        $this->description = $description;
        return $this;
    }

    public function getPrix(): ?float
    {
        return $this->prix;
    }

    public function setPrix(float $prix): static
    {
        $this->prix = $prix;
        return $this;
    }

    public function isDisponible(): ?bool
    {
        return $this->disponible;
    }

    public function setDisponible(bool $disponible): static
    {
        $this->disponible = $disponible;
        return $this;
    }

    public function getCategorie(): ?Categorie
    {
        return $this->categorie;
    }

    public function setCategorie(?Categorie $categorie): static
    {
        $this->categorie = $categorie;
        return $this;
    }

    /**
     * @return Collection<int, Image>
     */
    public function getImages(): Collection
    {
        return $this->images;
    }

    public function addImage(Image $image): static
    {
        if (!$this->images->contains($image)) {
            $this->images->add($image);
            $image->setProduit($this);
        }

        return $this;
    }

    public function removeImage(Image $image): static
    {
        if ($this->images->removeElement($image)) {
            // orphanRemoval=true + cascade remove => Doctrine supprime l'image
            if ($image->getProduit() === $this) {
                // nullable=false donc on évite de mettre null en base si possible
                // mais orphanRemoval gère la suppression, donc ce set null n'est plus nécessaire
                // On le laisse sans toucher au DB :
                // $image->setProduit(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, User>
     */
    public function getFavoris(): Collection
    {
        return $this->favoris;
    }

    public function addFavori(User $favori): static
    {
        if (!$this->favoris->contains($favori)) {
            $this->favoris->add($favori);
            $favori->addFavori($this);
        }

        return $this;
    }

    public function removeFavori(User $favori): static
    {
        if ($this->favoris->removeElement($favori)) {
            $favori->removeFavori($this);
        }

        return $this;
    }
}
