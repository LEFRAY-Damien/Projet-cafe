<?php

namespace App\Tests\Entity;

use App\Entity\Commande;
use PHPUnit\Framework\TestCase;

class CommandeTest extends TestCase
{
    public function testCommandeGettersSetters(): void
    {
        $commande = new Commande();

        $dateCommande = new \DateTimeImmutable('2026-01-19 10:00:00');
        $dateRetrait  = new \DateTime('2026-01-20');
        $statut       = 'EN_ATTENTE';

        $commande->setDateCommande($dateCommande);
        $commande->setDateRetrait($dateRetrait);
        $commande->setStatut($statut);

        $this->assertSame($dateCommande, $commande->getDateCommande());
        $this->assertSame($dateRetrait, $commande->getDateRetrait());
        $this->assertSame($statut, $commande->getStatut());

        // Tant que ce n'est pas persisté en BDD, l'id reste null
        $this->assertNull($commande->getId());
    }
}
