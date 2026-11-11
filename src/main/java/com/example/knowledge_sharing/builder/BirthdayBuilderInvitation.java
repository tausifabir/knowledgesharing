package com.example.knowledge_sharing.builder;

import com.example.knowledge_sharing.factory.simple.Invitation;

public class BirthdayBuilderInvitation implements Invitation {

    private final String recipient;
    private final String venue;
    private final String theme;
    private final String dressCode;

    public BirthdayBuilderInvitation(String recipient, String venue, String theme, String dressCode) {
        this.recipient = requireText(recipient, "Recipient");
        this.venue = requireText(venue, "Venue");
        this.theme = requireText(theme, "Theme");
        this.dressCode = requireText(dressCode, "dressCode");
    }


    @Override
    public String message() {
        return "Birthday invitation for " + recipient
                + " at " + venue
                + " | Theme: " + theme
                + " | Dress Code: " + dressCode;
    }


    public static final class Builder {
        private String recipient;
        private String venue = "Main Hall";
        private String theme = "White";
        private String dressCode = "Casual";

        public BirthdayBuilderInvitation.Builder recipient(String value) {
            this.recipient = value;
            return this;
        }

        public BirthdayBuilderInvitation.Builder venue(String value) {
            this.venue = value;
            return this;
        }

        public BirthdayBuilderInvitation.Builder theme(String value) {
            this.theme = value;
            return this;
        }

        public BirthdayBuilderInvitation.Builder dressCode(String value) {
            this.dressCode = value;
            return this;
        }


        public BirthdayBuilderInvitation build() {
            return new BirthdayBuilderInvitation(recipient, venue, theme, dressCode);
        }
    }

    private static String requireText(String value, String field) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(field + " required");
        }
        return value;
    }
}
