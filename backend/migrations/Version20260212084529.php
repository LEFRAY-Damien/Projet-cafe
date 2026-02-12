<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260212084529 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE commande_ligne DROP FOREIGN KEY FK_6E98044082EA2E54');
        $this->addSql('ALTER TABLE commande_ligne ADD CONSTRAINT FK_6E98044082EA2E54 FOREIGN KEY (commande_id) REFERENCES commande (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE user ADD deleted_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\'');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE commande_ligne DROP FOREIGN KEY FK_6E98044082EA2E54');
        $this->addSql('ALTER TABLE commande_ligne ADD CONSTRAINT FK_6E98044082EA2E54 FOREIGN KEY (commande_id) REFERENCES commande (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('ALTER TABLE user DROP deleted_at');
    }
}
