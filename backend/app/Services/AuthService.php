<?php

declare(strict_types=1);

namespace App\Services;

use App\Exceptions\BusinessRuleException;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\PersonalAccessToken;

class AuthService
{
    /**
     * Login user.
     *
     * @param array<string,mixed> $credentials
     * @return array<string,mixed>
     *
     * @throws BusinessRuleException
     */
    public function login(array $credentials): array
    {
        return DB::transaction(function () use ($credentials): array {

            $user = User::query()
                ->where('email', $credentials['email'])
                ->first();

            if (!$user || !Hash::check($credentials['password'], $user->password)) {
                throw new BusinessRuleException('Invalid credentials.');
            }

            $user->load('roles');

            $token = $user->createToken(
                $credentials['device_name'] ?? 'TransitOps API'
            )->plainTextToken;

            return [
                'user' => $user->load('roles', 'permissions'),
                'token' => $token,
            ];
        });
    }

    /**
     * Logout current user.
     */
    public function logout(User $user): void
    {
        $token = $user->currentAccessToken();

        if ($token instanceof PersonalAccessToken) {
            $token->delete();
        }
    }

    /**
     * Get authenticated user.
     */
    public function me(): User
    {
        /** @var User|null $user */
        $user = Auth::user();

        if (!$user) {
            throw new BusinessRuleException('Unauthenticated.');
        }

        return $user->load([
            'roles',
            'permissions',
        ]);
    }
}
