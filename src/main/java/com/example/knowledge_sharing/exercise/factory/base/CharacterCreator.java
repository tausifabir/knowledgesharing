package com.example.knowledge_sharing.exercise.factory.base;

// ponytail: functional product interfaces nested in abstract factory; extract when products gain state or multiple methods.
public abstract class CharacterCreator {

    public interface Weapon { String name(); }
    public interface Armor { String name(); }
    public interface SpecialAbility { String name(); }

    public abstract Weapon createWeapon();
    public abstract Armor createArmor();
    public abstract SpecialAbility createSpecialAbility();

    public String spawnCharacter() {
        return createWeapon().name()
                + " + " + createArmor().name()
                + " + " + createSpecialAbility().name();
    }
}
