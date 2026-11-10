package com.example.knowledge_sharing.factory.simple;

public class BirthdayInvitation implements Invitation {
    @Override
    public String message() {
        return "Birthday invitation";
    }
}
