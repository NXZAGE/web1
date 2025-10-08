package com.itmo.nxzage;

import com.fastcgi.FCGIInterface;
import com.itmo.nxzage.communication.Request;
import com.itmo.nxzage.communication.RequestParser;
import com.itmo.nxzage.communication.Response;
import com.itmo.nxzage.communication.Response.Status;
import com.itmo.nxzage.exceptions.ValidationException;
import com.itmo.nxzage.models.Point;
import com.itmo.nxzage.validation.RequestValidator;
import com.itmo.nxzage.validation.Validator;
import lombok.extern.slf4j.Slf4j;

/**
 * Simple FCGI Server
 */
@Slf4j
public final class Server {
    private final FCGIInterface fcgi;
    private final RequestParser parser;
    private final PointInRegionService figureService;
    private final Validator<Request> requestValidator;
    private boolean running;

    public Server() {
        fcgi = new FCGIInterface();
        parser = new RequestParser();
        figureService = new PointInRegionService();
        requestValidator = new RequestValidator();
        initFigureService();
    }

    public void run() {
        running = true;
        while (running && fcgi.FCGIaccept() >= 0) {
            processRequst();
        }
    }

    public Response buildCorrectResponse(Request request) {
        try {
            requestValidator.validate(request);
        } catch (ValidationException e) {
            log.error("Validation exception :" + e.getMessage(), e);
            return buildErrorResposne(Status.BAD_REQUEST, "Validation failed: %s".formatted(e.getMessage()));
        }
        if (request.getMethod().equals("POST")) {
            // TODO important add validation
            Point point;
            double r;
            boolean hit;
            try {
                Double x = (Double) request.getArgs().get("x");
                Double y = (Double) request.getArgs().get("y");
                r = (Double) request.getArgs().get("r");
                point = new Point(x, y);
                hit = figureService.regionContainsPoint(point, r);
            } catch (Exception e) {
                // TODO log error 
                log.error(e.getMessage());
                return buildErrorResposne(Status.INTERNAL_SERVER_ERROR);
            }
            var body = "{\n  \"hit\": %b\n}".formatted(hit);
            return Response.builder().body(body).status(Status.OK).build().header("Content-Type", "application/json");
        } else return buildErrorResposne(Status.METHOD_NOT_ALLOWED);
    }

    public Response buildErrorResposne(Status status) {
        return Response.builder().status(status).body(status.getMessage()).build().header("Content-Type", "text/html");
    }

    public Response buildErrorResposne(Status status, String message) {
        return Response.builder().status(status).body(message).build().header("Content-Type", "text/html");
    }

    public void processRequst() {
        try {
            Request request = parser.parse(FCGIInterface.request);
            Response response = buildCorrectResponse(request);
            response.send();
        } catch (Exception e) {
            // TODO make realisation
            buildErrorResposne(Status.BAD_REQUEST, e.getMessage()).send();
            // TODO log error
        }
    }

    private void initFigureService() {
        figureService.addRegion((p, r) -> (p.y()>=0 && p.y()<=r && p.x()>=0 && p.x()<=r/2));
        figureService.addRegion((p, r) -> (p.y()>=0 && p.y()<=r && p.x()<=0 && p.y()<p.x()*2+r));
        figureService.addRegion((p, r) -> (p.x()<=0 && p.y()<=0 && p.x()*p.x()+p.y()*p.y()<=(r/2)*(r/2)));
    }
}
