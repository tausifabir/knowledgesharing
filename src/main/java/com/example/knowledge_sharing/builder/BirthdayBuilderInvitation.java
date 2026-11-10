package com.example.knowledge_sharing.builder;

import com.example.knowledge_sharing.factory.simple.Invitation;

public class BirthdayBuilderInvitation implements Invitation {

    private final String recipient;
    private final String venue;
    private final String theme;
    private final String decorationType;

    public BirthdayBuilderInvitation(String recipient, String venue, String theme, String decorationType) {
        this.recipient = requireText(recipient, "Recipient");
        this.venue = requireText(venue, "Venue");
        this.theme = requireText(theme, "Theme");
        this.decorationType = requireText(theme, "Ballon");
    }


    @Override
    public String message() {
        return "";
    }


    public static final class Builder {
        private String recipient;
        private String venue = "Main Hall";
        private String theme = "White";
        private String decorationType = "Ballon";

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

        public BirthdayBuilderInvitation.Builder decorationType(String value) {
            this.decorationType = value;
            return this;
        }

        public BirthdayBuilderInvitation build() {
            return new BirthdayBuilderInvitation(recipient, venue, theme, decorationType);
        }
    }

    private static String requireText(String value, String field) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(field + " required");
        }
        return value;
    }
}
