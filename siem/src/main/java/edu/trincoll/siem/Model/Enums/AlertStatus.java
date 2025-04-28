package edu.trincoll.siem.Model.Enums;

import lombok.Getter;

@Getter
public enum AlertStatus {
    OPEN("Open"),
    INVESTIGATING("Investigating"),
    RESOLVED("Resolved");

    private final String value;

    AlertStatus(String value) {
        this.value = value;
    }

    @Override
    public String toString() {
        return value;
    }
}