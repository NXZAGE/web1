package com.itmo.nxzage.communication;

import java.util.Map;
import lombok.Value;

@Value
public final class Request {
    private final Map<String, Object> args;
    private final String method;
}
