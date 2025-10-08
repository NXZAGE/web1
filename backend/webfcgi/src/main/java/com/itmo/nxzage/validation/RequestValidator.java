package com.itmo.nxzage.validation;

import java.util.List;
import com.itmo.nxzage.communication.Request;
import com.itmo.nxzage.exceptions.ValidationException;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public final class RequestValidator implements Validator<Request> {
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
        
        return;
    }
}
