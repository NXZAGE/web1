package com.itmo.nxzage;

import java.util.LinkedList;
import java.util.List;
import com.itmo.nxzage.models.PlaneRegion;
import com.itmo.nxzage.models.Point;
import lombok.NonNull;

/**
 * Main evaluating service
 */
public final class PointInRegionService {
    private final List<PlaneRegion> fragments = new LinkedList<>();

    /**
     * Check if point contains complex region, assembled from single fragments <br>
     * 
     * @param point - point(x, y) to check
     * @param scope - scope of OX&OY axes
     * @return <b>true</b> if point in defined region else <b>false</b>
     */
    public boolean regionContainsPoint(@NonNull Point point, double scope) {
        return fragments.stream().anyMatch(region -> region.containsPoint(point, scope));
    }
 
    public void addRegion(@NonNull PlaneRegion region) {
        fragments.add(region);
    }
}
