package com.itmo.nxzage.communication;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Pattern;
import com.fastcgi.FCGIInterface;
import com.fastcgi.FCGIRequest;
import com.itmo.nxzage.exceptions.request.MalformedContent;
import com.itmo.nxzage.exceptions.request.UnsupportedRequest;
import com.itmo.nxzage.exceptions.request.UnsupportedRequestType;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class RequestParser {
    private static final Pattern KEY_VAL_PAIR_PATTERN;
    private static final List<String> SUPPORTED_METHODS = new ArrayList<>();

    static {
        SUPPORTED_METHODS.add("GET");
        SUPPORTED_METHODS.add("POST");
        SUPPORTED_METHODS.add("OPTIONS");
        KEY_VAL_PAIR_PATTERN = Pattern.compile("^([a-zA-Z_]+)=((?:-)?\\d+(?:\\.\\d+)?)$");
    }

    public Request parse(FCGIRequest request) throws UnsupportedRequest {
        log.debug("Request parsing started...");
        String method = parseMethod(request);
        if (method.equals("OPTIONS")) {
            return new Request(new HashMap(), method);
        }
        log.debug("Parsed methdod: %s".formatted(method));
        String content = null;
        try {
            content = getRequestBody(request);
            log.debug("Content parsed: '%s'".formatted(content));
        } catch (IOException e) {
            log.error("Failed to get request body", e);
            throw new MalformedContent(e);
        }
        Map<String, Object> params = switch (method) {
            case "GET" -> new HashMap<>();
            case "POST" -> parseParams(content);
            default -> throw new IllegalStateException();
        };
        log.debug("Request ready to build");
        return new Request(params, method);
    }

    private static String parseMethod(FCGIRequest request) throws UnsupportedRequestType {
        String method = request.params.getProperty("REQUEST_METHOD");
        if (SUPPORTED_METHODS.stream()
                .noneMatch(supportedMethod -> method.equals(supportedMethod))) {
            throw new UnsupportedRequestType("Request <%s> is not supported".formatted(method));
        } else {
            return method;
        }
    }

    private static String getRequestBody(FCGIRequest request) throws IOException {
        FCGIInterface.request.params.forEach((key, val) -> log.debug("PROP %s: %s".formatted(key, val)));
        int contentLength = Optional.ofNullable(FCGIInterface.request.params.getProperty("CONTENT_LENGTH"))
                .map(Integer::parseInt).orElse(0);
        log.debug("Content length header read: {%d}".formatted(contentLength));
        FCGIInterface.request.inStream.fill();
        byte[] bodyBytes = request.inStream.readNBytes(contentLength);
        if (bodyBytes.length != contentLength) {
            throw new RuntimeException("Failed to read full request body");
        }

        return new String(bodyBytes, StandardCharsets.UTF_8);
    }

    private static Map<String, Object> parseParams(String requestBody) throws MalformedContent {
        log.debug("Started to parsing pararms");
        var params = new HashMap<String, Object>();
        List<String> pairs = List.of(requestBody.split("&"));
        log.debug("Got %d param-pairs.".formatted(pairs.size()));
        pairs.stream().forEach(log::debug);
        for (String pair : pairs) {
            log.debug("Parsing pair %s".formatted(pair));
            parseAndPutKeyVal(pair, params);
            log.debug("Pair successfully parsed");
        }
        return params;
    }

    private static void parseAndPutKeyVal(String keyVal, Map<String, Object> params) throws MalformedContent {
        var matcher = KEY_VAL_PAIR_PATTERN.matcher(keyVal);
        if (matcher.find()) {
            String key = matcher.group(1);
            String value = matcher.group(2);

            try {
                Double doubleValue = Double.parseDouble(value);
                params.put(key, doubleValue);
                return;
            } catch (NumberFormatException e1) {
                throw new MalformedContent("Failed to parse parameter '%s'".formatted(key));
            }
        } else {
            throw new MalformedContent("Failed to parse params");
        }
    }
}
