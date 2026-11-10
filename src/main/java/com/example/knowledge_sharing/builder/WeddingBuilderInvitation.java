package com.example.knowledge_sharing.builder;

import com.example.knowledge_sharing.factory.simple.Invitation;

public class WeddingBuilderInvitation implements Invitation {
    private final String recipient;
    private final String venue;
    private final String theme;

    public WeddingBuilderInvitation(String recipient, String venue, String theme) {
        this.recipient = requireText(recipient, "Recipient");
        this.venue = requireText(venue, "Venue");
        this.theme = requireText(theme, "Theme");
    }

    @Override
    public String message() {
        return "Wedding invitation for " + recipient
                + " at " + venue
                + " | Theme: " + theme;
    }

    public static final class Builder {
        private String recipient;
        private String venue = "Main Hall";
        private String theme = "White";

        public Builder recipient(String value) {
            this.recipient = value;
            return this;
        }

        public Builder venue(String value) {
            this.venue = value;
            return this;
        }

        public Builder theme(String value) {
            this.theme = value;
            return this;
        }

        public WeddingBuilderInvitation build() {
            return new WeddingBuilderInvitation(recipient, venue, theme);
        }
    }

    private static String requireText(String value, String field) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(field + " required");
        }
        return value;
    }

}


