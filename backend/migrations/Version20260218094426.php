<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260218094426 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE commande_ligne (id INT AUTO_INCREMENT NOT NULL, commande_id INT NOT NULL, produit_id INT NOT NULL, quantite INT NOT NULL, prix_unitaire DOUBLE PRECISION NOT NULL, INDEX IDX_6E98044082EA2E54 (commande_id), INDEX IDX_6E980440F347EFB (produit_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE commande_ligne ADD CONSTRAINT FK_6E98044082EA2E54 FOREIGN KEY (commande_id) REFERENCES commande (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE commande_ligne ADD CONSTRAINT FK_6E980440F347EFB FOREIGN KEY (produit_id) REFERENCES produit (id)');
        $this->addSql('ALTER TABLE commande CHANGE date_retrait date_retrait DATE DEFAULT NULL');
           }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE commande_ligne DROP FOREIGN KEY FK_6E98044082EA2E54');
        $this->addSql('ALTER TABLE commande_ligne DROP FOREIGN KEY FK_6E980440F347EFB');
        $this->addSql('DROP TABLE commande_ligne');
        $this->addSql('ALTER TABLE commande CHANGE date_retrait date_retrait DATE NOT NULL');
        $this->addSql('ALTER TABLE user DROP deleted_at, CHANGE is_active is_active TINYINT(1) NOT NULL');
    }
}
