package com.itmo.nxzage.communication;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import com.itmo.nxzage.exceptions.response.ResponseValidationException;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Builder
@AllArgsConstructor
@Getter
public final class Response {
    private static final String HTTP_VERSION = "HTTP/1.1";
    // TODO move to another class 
    public static final DateTimeFormatter HTTP_DATE_FORMATTER = 
        DateTimeFormatter.ofPattern("EEE, dd MMM yyyy HH:mm:ss z", Locale.ENGLISH)
                        .withZone(ZoneId.of("GMT"));
    private final Map<String, String> headers = new HashMap<>();
    private final Status status;
    private final String body;

    private void internalSend() {
        System.out.println(getStatusLine());
        headers.forEach((header, value) -> System.out.println("%s: %s".formatted(header, value)));
        System.out.println();
        if (body != null) {
            System.out.println(body);
        }
    }

    private String getStatusLine() {
        return "%s %s %s".formatted(HTTP_VERSION, status.getCode(), status.getMessage());
    }

    private void setContentLengthHeader() {
        if (body == null) {
            headers.put("Content-Length", String.valueOf(0));
            return;
        }
        if (headers.containsKey("Content-Length")) {
            // TODO check
            // TODO log error
        }
        headers.put("Content-Length", String.valueOf(body.getBytes().length));
    }

    private void setDateHeader() {
        headers.put("Date", HTTP_DATE_FORMATTER.format(Instant.now()));
    }

    private void setCors() {
        headers.put("Access-Control-Allow-Origin", "*");
    }

    private void checkIndispensableHeaders() {
        if (!headers.containsKey("Content-Type")) {
            throw new ResponseValidationException("Response should contain 'Content-Type' header");
        }

        if (!headers.containsKey("Content-Length")) {
            throw new ResponseValidationException(
                    "Response should contain 'Content-Lenght' header");
        }
    }

    public Response header(String key, String value) {
        headers.put(key, value);
        return this;
    }

    public void send() {
        setDateHeader();
        setContentLengthHeader();
        setCors();
        // checkIndispensableHeaders();
        internalSend();
    }

    @Getter
    @AllArgsConstructor
    public enum Status {
        // 2xx Success
        OK(200, "OK"),

        // 4xx Client Errors
        BAD_REQUEST(400, "Bad Request"), UNAUTHORIZED(401, "Unauthorized"), FORBIDDEN(403,
                "Forbidden"), NOT_FOUND(404,
                        "Not Found"), METHOD_NOT_ALLOWED(405, "Method Not Allowed"),

        // 5xx Server Errors
        INTERNAL_SERVER_ERROR(500, "Internal Server Error");

        private final int code;
        private final String message;
    }
}
