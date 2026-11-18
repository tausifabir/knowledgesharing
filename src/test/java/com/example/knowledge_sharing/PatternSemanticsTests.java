package com.example.knowledge_sharing;

import com.example.knowledge_sharing.builder.BirthdayBuilderInvitation;
import com.example.knowledge_sharing.builder.WeddingBuilderInvitation;
import com.example.knowledge_sharing.exercise.builder.ArcherBuilder;
import com.example.knowledge_sharing.exercise.builder.MageBuilder;
import com.example.knowledge_sharing.exercise.builder.WarriorBuilder;
import com.example.knowledge_sharing.prototype.InvitationCard;
import com.example.knowledge_sharing.singleton.Whiteboard;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Modifier;

import static org.junit.jupiter.api.Assertions.*;

class PatternSemanticsTests {
    @Test
    void singletonPublishesSharedStateAcrossThreads() throws Exception {
        // A thread handoff alone can hide a missing volatile; check the visibility contract too.
        assertTrue(Modifier.isVolatile(Whiteboard.class.getDeclaredField("text").getModifiers()));
        Whiteboard board = Whiteboard.getInstance();
        synchronized (board) {
            String previous = board.read();
            try {
                Thread writer = new Thread(() -> Whiteboard.getInstance().write("Shared across threads"));
                writer.start();
                writer.join();
                assertSame(board, Whiteboard.getInstance());
                assertEquals("Shared across threads", board.read());
            } finally {
                board.write(previous);
            }
        }
    }

    @Test
    void copiesShareOnlyIntendedState() {
        InvitationCard original = new InvitationCard("Guest", new StringBuilder("Hello"));
        InvitationCard shallow = original.shallowCopy();
        InvitationCard deep = original.deepCopy();
        assertNotSame(original, shallow);
        assertNotSame(original, deep);
        assertSame(original.getGuestName(), deep.getGuestName());
        assertSame(original.getMessage(), shallow.getMessage());
        assertNotSame(original.getMessage(), deep.getMessage());
        shallow.setGuestName("Alice");
        shallow.getMessage().append(" shared");
        deep.getMessage().append(" private");
        assertEquals("Guest", original.getGuestName());
        assertEquals("Hello shared", original.getMessage().toString());
        assertEquals("Hello private", deep.getMessage().toString());
    }

    @Test
    void invitationBuildersKeepDefaultsAndBuildIndependentProducts() {
        var wedding = new WeddingBuilderInvitation.Builder().recipient("Alice");
        var firstWedding = wedding.build();
        assertEquals("Wedding invitation for Alice at Main Hall | Theme: White", firstWedding.message());
        assertNotSame(firstWedding, wedding.build());
        assertEquals("Wedding invitation for Bob at Garden | Theme: Gold",
                wedding.recipient("Bob").venue("Garden").theme("Gold").build().message());
        assertEquals("Wedding invitation for Alice at Main Hall | Theme: White", firstWedding.message());

        var birthday = new BirthdayBuilderInvitation.Builder().recipient("Alice");
        var firstBirthday = birthday.build();
        assertEquals("Birthday invitation for Alice at Main Hall | Theme: White | Dress Code: Casual", firstBirthday.message());
        assertNotSame(firstBirthday, birthday.build());
        birthday.recipient("Bob").venue("Garden").theme("Gold").dressCode("Formal").build();
        assertEquals("Birthday invitation for Alice at Main Hall | Theme: White | Dress Code: Casual", firstBirthday.message());
    }

    @Test
    void invitationBuildersRejectMissingOrBlankFields() {
        assertThrows(IllegalArgumentException.class, () -> new WeddingBuilderInvitation.Builder().build());
        assertThrows(IllegalArgumentException.class, () -> new BirthdayBuilderInvitation.Builder().build());
        for (String invalid : new String[]{null, "", " "}) {
            assertThrows(IllegalArgumentException.class, () -> new WeddingBuilderInvitation.Builder().recipient(invalid).build());
            assertThrows(IllegalArgumentException.class, () -> new WeddingBuilderInvitation.Builder().recipient("Alice").venue(invalid).build());
            assertThrows(IllegalArgumentException.class, () -> new WeddingBuilderInvitation.Builder().recipient("Alice").theme(invalid).build());
            assertThrows(IllegalArgumentException.class, () -> new BirthdayBuilderInvitation.Builder().recipient(invalid).build());
            assertThrows(IllegalArgumentException.class, () -> new BirthdayBuilderInvitation.Builder().recipient("Alice").venue(invalid).build());
            assertThrows(IllegalArgumentException.class, () -> new BirthdayBuilderInvitation.Builder().recipient("Alice").theme(invalid).build());
            assertThrows(IllegalArgumentException.class, () -> new BirthdayBuilderInvitation.Builder().recipient("Alice").dressCode(invalid).build());
        }
    }

    @Test
    void characterBuildersCopyAllSettingsWithoutSharingMutableBuilder() {
        var warrior = new WarriorBuilder().weapon("Sword").armor("Plate").specialAbility("Slash").level(10).comboSkills("Combo");
        var mage = new MageBuilder().weapon("Staff").armor("Robe").specialAbility("Fire").level(20).comboSkills("Meteor");
        var archer = new ArcherBuilder().weapon("Bow").armor("Leather").specialAbility("Aim").level(30).comboSkills("Volley");
        var builtWarrior = warrior.build();
        var builtMage = mage.build();
        var builtArcher = archer.build();
        assertNotSame(warrior, builtWarrior);
        assertNotSame(mage, builtMage);
        assertNotSame(archer, builtArcher);
        assertEquals(warrior.toString(), builtWarrior.toString());
        assertEquals(mage.toString(), builtMage.toString());
        assertEquals(archer.toString(), builtArcher.toString());
        warrior.weapon("Changed").level(11).comboSkills("Changed");
        mage.weapon("Changed").level(21).comboSkills("Changed");
        archer.weapon("Changed").level(31).comboSkills("Changed");
        assertEquals("Sword", builtWarrior.getWeapon());
        assertEquals(10, builtWarrior.getLevel());
        assertEquals("Combo", builtWarrior.getComboSkills());
        assertEquals("Staff", builtMage.getWeapon());
        assertEquals(20, builtMage.getLevel());
        assertEquals("Meteor", builtMage.getComboSkills());
        assertEquals("Bow", builtArcher.getWeapon());
        assertEquals(30, builtArcher.getLevel());
        assertEquals("Volley", builtArcher.getComboSkills());
    }

    @Test
    void deepCopyPreservesAbsentMessage() {
        InvitationCard original = new InvitationCard("Guest", null);
        InvitationCard copy = original.deepCopy();
        assertNotSame(original, copy);
        assertNull(copy.getMessage());
        original.setMessage(new StringBuilder("Later"));
        original.setMessage(null);
        assertNull(original.deepCopy().getMessage());
    }
}
