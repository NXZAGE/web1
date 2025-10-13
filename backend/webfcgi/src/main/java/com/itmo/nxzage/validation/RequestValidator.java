package com.itmo.nxzage.validation;

import java.util.List;
import com.itmo.nxzage.communication.Request;
import com.itmo.nxzage.exceptions.ValidationException;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public final class RequestValidator implements Validator<Request> {
    public static final Double MINX = -10D;
    public static final Double MAXX = 10D;
    public static final Double MINY = -10D;
    public static final Double MAXY = 10D;
    public static final Double MINR = 1D;
    public static final Double MAXR = 4D;

    public void validate(Request req) throws ValidationException{
        List<String> allowedMethdods = List.of("POST");
        List<String> requiredParams = List.of("x", "y", "r");

        if (req.getMethod() == null) {
            throw new ValidationException("Request method can't be null");
        } else {
            log.debug("Processing validation: method defined");
        }
        if (!allowedMethdods.contains(req.getMethod())) {
            throw new ValidationException("Method <%s> is not allowed".formatted(req.getMethod()));
        } else {
            log.debug("Processing validation: method is valid");
        }
        if (!requiredParams.stream().allMatch((key) -> (
                    req.getArgs().containsKey(key) && req.getArgs().get(key) instanceof Double
                    )
                )
            ) {
            throw new ValidationException("Request doesn't contain all of required params or type assertions failed");
        } else {
            log.debug("Processing validation: required params is valid");
        }
        Double x = (Double) req.getArgs().get("x");
        Double y = (Double) req.getArgs().get("y");
        Double r = (Double) req.getArgs().get("r");

        if (!(x >= MINX && x <= MAXX)) {
            throw new ValidationException("X must be in range [%f; %f]".formatted(MINX, MAXX));
        }
        if (!(y >= MINY && y <= MAXY)) {
            throw new ValidationException("Y must be in range [%f; %f]".formatted(MINY, MAXY));
        }
        if (!(r >= MINR && r <= MAXR)) {
            throw new ValidationException("R must be in range [%f; %f]".formatted(MINR, MAXR));
        }
        
        return;
    }
}
