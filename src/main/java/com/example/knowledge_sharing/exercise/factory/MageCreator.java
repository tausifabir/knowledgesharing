package com.example.knowledge_sharing.exercise.factory;

import com.example.knowledge_sharing.exercise.factory.base.CharacterCreator;

public class MageCreator extends CharacterCreator {

    @Override
    public Weapon createWeapon() {
        return () -> "Arcane Staff";
    }

    @Override
    public Armor createArmor() {
        return () -> "Silk Robe";
    }

    @Override
    public SpecialAbility createSpecialAbility() {
        return () -> "Fireball";
    }
}
