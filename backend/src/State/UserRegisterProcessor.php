<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

final class UserRegisterProcessor implements ProcessorInterface
{
    public function __construct(
        private EntityManagerInterface $em,
        private UserPasswordHasherInterface $hasher
    ) {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
    {
        /** @var User $user */
        $user = $data;

        // Valeurs forcées (sécurité)
        $user->setRoles(['ROLE_USER']);
        $user->setIsActive(true);

        $plain = $user->getPlainPassword();
        if (!$plain) {
            throw new \InvalidArgumentException('plainPassword est obligatoire.');
        }

        $user->setPassword($this->hasher->hashPassword($user, $plain));
        $user->setPlainPassword(null);

        $this->em->persist($user);
        $this->em->flush();

        return $user;
    }
}
