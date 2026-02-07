<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use App\Repository\CommandeRepository;
use App\State\CommandeProcessor;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ApiResource(
    operations: [
        // ✅ ADMIN: liste de toutes les commandes
        new GetCollection(
            uriTemplate: '/admin/commandes',
            security: "is_granted('ROLE_ADMIN')",
            normalizationContext: ['groups' => ['admin:commande:read']]
        ),

        // ✅ ADMIN: détail d’une commande
        new Get(
            uriTemplate: '/admin/commandes/{id}',
            security: "is_granted('ROLE_ADMIN')",
            normalizationContext: ['groups' => ['admin:commande:read']]
        ),

        // USER
        new Get(security: "object.getUser() == user or is_granted('ROLE_ADMIN')"),
        new GetCollection(security: "is_granted('ROLE_USER')"),
        new Post(
            security: "is_granted('ROLE_USER')",
            output: false
        ),
    ],
    denormalizationContext: ['groups' => ['commande:write']],
    processor: CommandeProcessor::class
)]
class Commande
{
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
    #[Groups(['commande:read', 'admin:commande:read'])]
    private ?string $statut = null;

    #[ORM\ManyToOne(inversedBy: 'commandes')]
    #[ORM\JoinColumn(nullable: false)]
    #[ApiProperty(readable: false, writable: false)]
    private ?User $user = null;

    #[ORM\OneToMany(mappedBy: 'commande', targetEntity: CommandeLigne::class, cascade: ['persist'], orphanRemoval: true)]
    #[Groups(['commande:read', 'commande:write', 'admin:commande:read'])]
    private Collection $lignes;
}
