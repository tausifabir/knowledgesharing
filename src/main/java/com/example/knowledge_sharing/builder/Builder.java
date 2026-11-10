package com.example.knowledge_sharing.builder;

public final class Builder {
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
