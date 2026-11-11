package com.example.knowledge_sharing.exercise.factory;

import com.example.knowledge_sharing.exercise.factory.base.CharacterCreator;

public class ArcherCreator extends CharacterCreator {

    @Override
    public Weapon createWeapon() {
        return () -> "Longbow";
    }

    @Override
    public Armor createArmor() {
        return () -> "Leather Armor";
    }

    @Override
    public SpecialAbility createSpecialAbility() {
        return () -> "Eagle Eye";
    }
}
