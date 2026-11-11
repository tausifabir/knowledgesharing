package com.example.knowledge_sharing.exercise.factory;

import com.example.knowledge_sharing.exercise.factory.base.CharacterCreator;

public class WarriorCreator extends CharacterCreator {

    @Override
    public Weapon createWeapon() {
        return () -> "Greatsword";
    }

    @Override
    public Armor createArmor() {
        return () -> "Plate Armor";
    }

    @Override
    public SpecialAbility createSpecialAbility() {
        return () -> "Berserk Slash";
    }
}
