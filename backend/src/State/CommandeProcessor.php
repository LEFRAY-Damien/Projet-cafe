<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use Symfony\Bundle\SecurityBundle\Security;
use App\Entity\Commande;

class CommandeProcessor implements ProcessorInterface
{
    public function __construct(
        private Security $security,
        private ProcessorInterface $writeProcessor,
    ) {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
    {
        if ($data instanceof Commande && null === $data->getUser()) {
            $data->setUser($this->security->getUser());
            $data->setDateCommande(new \DateTimeImmutable());
            $data->setStatut('en_attente');
        }

        return $this->writeProcessor->process($data, $operation, $uriVariables, $context);
    }
}
