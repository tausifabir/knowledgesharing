package com.example.knowledge_sharing.exercise.builder;

import com.example.knowledge_sharing.exercise.builder.base.CharacterBaseBuilder;
import lombok.Getter;
import lombok.ToString;

@Getter
@ToString(callSuper = true)
public class ArcherBuilder extends CharacterBaseBuilder {
    private int level;
    private String comboSkills;

    public ArcherBuilder() {}

    public ArcherBuilder(String weapon, String armor, String specialAbility, int level, String comboSkills) {
        this.weapon = weapon;
        this.armor = armor;
        this.specialAbility = specialAbility;
        this.level = level;
        this.comboSkills = comboSkills;
    }

    @Override
    public ArcherBuilder weapon(String value) {
        super.weapon(value);
        return this;
    }

    @Override
    public ArcherBuilder armor(String value) {
        super.armor(value);
        return this;
    }

    @Override
    public ArcherBuilder specialAbility(String value) {
        super.specialAbility(value);
        return this;
    }

    public ArcherBuilder level(int value) {
        this.level = value;
        return this;
    }

    public ArcherBuilder comboSkills(String value) {
        this.comboSkills = value;
        return this;
    }

    // ponytail: builder doubles as product; split immutable Archer class when state sharing across threads needed.
    public ArcherBuilder build() {
        return new ArcherBuilder(weapon, armor, specialAbility, level, comboSkills);
    }
}
