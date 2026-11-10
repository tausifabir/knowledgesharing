package com.example.knowledge_sharing.singleton;

public class Whiteboard {

    private static final Whiteboard INSTANCE = new Whiteboard();

    private String text = "";

    private Whiteboard() {}

    public static Whiteboard getInstance() {
        return INSTANCE;
    }

    public void write(String message) {
        text = message;
    }

    public String read() {
        return text;
    }
}
