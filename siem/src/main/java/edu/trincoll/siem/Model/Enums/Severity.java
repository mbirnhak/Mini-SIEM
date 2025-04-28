package edu.trincoll.siem.Model.Enums;

import lombok.Getter;

@Getter
public enum Severity {
    LOW("Low"),
    MEDIUM("Medium"),
    HIGH("High");

    private final String value;

    Severity(String value) {
        this.value = value;
    }

    @Override
    public String toString() {
        return value;
    }
}