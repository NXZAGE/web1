package com.itmo.nxzage.validation;

import com.itmo.nxzage.exceptions.ValidationException;

@FunctionalInterface
public interface Validator<T> {
    public void validate(T obj) throws ValidationException;
}
