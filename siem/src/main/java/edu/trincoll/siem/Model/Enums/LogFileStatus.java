package edu.trincoll.siem.Model.Enums;

import lombok.Getter;

@Getter
public enum LogFileStatus {
    UPLOADED("Uploaded"),
    PENDING("Pending"),
    FAILED("Failed");

    private final String value;

    LogFileStatus(String value) {
        this.value = value;
    }

    @Override
    public String toString() {
        return value;
    }
}