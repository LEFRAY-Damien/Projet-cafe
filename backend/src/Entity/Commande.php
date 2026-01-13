<?php

namespace App\Entity;

use App\Repository\CommandeRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use App\State\CommandeProcessor;
use ApiPlatform\Metadata\ApiProperty;

#[ApiResource(
    operations: [
        new Get(security: "object.getUser() == user or is_granted('ROLE_ADMIN')"),
        new GetCollection(security: "is_granted('ROLE_USER')"),
        new Post(security: "is_granted('ROLE_USER')"),
    ],
    processor: CommandeProcessor::class
)]


#[ORM\Entity(repositoryClass: CommandeRepository::class)]
class Commande
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $dateCommande = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    private ?\DateTime $dateRetrait = null;

    #[ORM\Column(length: 30)]
    private ?string $statut = null;

    #[ORM\ManyToOne(inversedBy: 'commandes')]
    #[ORM\JoinColumn(nullable: false)]
    #[ApiProperty(readable: false, writable: false)]
    private ?User $user = null;


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

    public function setDateRetrait(\DateTime $dateRetrait): static
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
}
