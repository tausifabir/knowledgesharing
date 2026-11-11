package com.example.knowledge_sharing.exercise.builder.base;

import lombok.Getter;
import lombok.ToString;

@Getter
@ToString
public class CharacterBaseBuilder {
    protected String weapon;
    protected String armor;
    protected String specialAbility;

    public CharacterBaseBuilder weapon(String value) {
        this.weapon = value;
        return this;
    }

    public CharacterBaseBuilder armor(String value) {
        this.armor = value;
        return this;
    }

    public CharacterBaseBuilder specialAbility(String value) {
        this.specialAbility = value;
        return this;
    }
}
