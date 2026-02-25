<?php

namespace App\Tests\Entity;

use App\Entity\Commande;
use App\Entity\CommandeLigne;
use PHPUnit\Framework\TestCase;

class CommandeTest extends TestCase
{
    /**
     * Test des getters / setters de base
     */
    public function testCommandeGettersSetters(): void
    {
        $commande = new Commande();

        $dateCommande = new \DateTimeImmutable('2026-01-19 10:00:00');
        $dateRetrait  = new \DateTime('2026-01-20');
        $statut       = Commande::STATUT_EN_ATTENTE;

        $commande->setDateCommande($dateCommande);
        $commande->setDateRetrait($dateRetrait);
        $commande->setStatut($statut);

        $this->assertSame($dateCommande, $commande->getDateCommande());
        $this->assertSame($dateRetrait, $commande->getDateRetrait());
        $this->assertSame($statut, $commande->getStatut());

        // Tant que ce n'est pas persisté en BDD, l'id reste null
        $this->assertNull($commande->getId());
    }

    /**
     * Test des valeurs par défaut lors de la création d'une commande
     */
    public function testDefaultValuesOnNewCommande(): void
    {
        $commande = new Commande();

        // Statut par défaut
        $this->assertSame(Commande::STATUT_EN_ATTENTE, $commande->getStatut());

        // Date de commande automatiquement initialisée
        $this->assertInstanceOf(\DateTimeImmutable::class, $commande->getDateCommande());

        // Collection de lignes initialisée et vide
        $this->assertCount(0, $commande->getLignes());
    }

    /**
     * Test de la relation Commande <-> CommandeLigne
     */
    public function testAddAndRemoveLigneMaintainsBothSides(): void
    {
        $commande = new Commande();
        $ligne = new CommandeLigne();

        // Ajout de la ligne
        $commande->addLigne($ligne);

        $this->assertCount(1, $commande->getLignes());
        $this->assertSame($commande, $ligne->getCommande());

        // Pas de duplication si on ajoute la même ligne
        $commande->addLigne($ligne);
        $this->assertCount(1, $commande->getLignes());

        // Suppression de la ligne
        $commande->removeLigne($ligne);

        $this->assertCount(0, $commande->getLignes());
        $this->assertNull($ligne->getCommande());
    }
}