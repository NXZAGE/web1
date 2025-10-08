package com.itmo.nxzage.models;

import lombok.NonNull;

@FunctionalInterface
public interface PlaneRegion {
    public boolean containsPoint(@NonNull Point point, double scope);
}
