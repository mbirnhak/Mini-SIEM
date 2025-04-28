package edu.trincoll.siem.Model.Enums;

import lombok.Getter;

@Getter
public enum Role {
    ADMIN("Admin"),
    ANALYST("Analyst");

    private final String value;

    Role(String value) {
        this.value = value;
    }

    @Override
    public String toString() {
        return value;
    }
}