"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";

/**
 * Reusable City Rotation Hook (Every 60 seconds)
 * 
 * Automatically rotates the displayed city every 60 seconds from available cities
 * where relevant properties actually exist in the database.
 * 
 * Provides:
 *  - activeCity: Currently displayed city name
 *  - activeProperties: Properties matching the active city and category
 *  - eligibleCities: List of all eligible cities with properties
 *  - isTransitioning: Boolean for smooth fade/swap animations
 *  - nextCity / prevCity: Manual controls that also restart the 60s timer
 *  - setCityByName: Allows selecting a specific city directly from clickable pills/tabs
 */
export function useRotatingCitySection({
  initialGroupedData = {},
  categorySlug = null,
  rotationIntervalMs = 5000,
}) {
  // 1. Extract eligible cities that actually contain at least 1 property
  const eligibleCities = useMemo(() => {
    return Object.keys(initialGroupedData || {}).filter(
      (c) => Array.isArray(initialGroupedData[c]) && initialGroupedData[c].length > 0
    );
  }, [initialGroupedData]);

  const [cityIndex, setCityIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  const totalCities = eligibleCities.length;
  const activeCity = totalCities > 0 ? eligibleCities[cityIndex % totalCities] : "All India";
  const activeProperties = activeCity && initialGroupedData[activeCity] ? initialGroupedData[activeCity] : [];

  // Transition helper
  const changeCityToIndex = useCallback((newIdx) => {
    if (totalCities <= 1) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCityIndex(newIdx);
      setIsTransitioning(false);
    }, 250);
  }, [totalCities]);

  // Select city directly by name
  const setCityByName = useCallback((cityName) => {
    const idx = eligibleCities.findIndex((c) => c.toLowerCase() === cityName.toLowerCase());
    if (idx !== -1) {
      changeCityToIndex(idx);
    }
  }, [eligibleCities, changeCityToIndex]);

  // Next city
  const nextCity = useCallback(() => {
    if (totalCities <= 1) return;
    const nextIdx = (cityIndex + 1) % totalCities;
    changeCityToIndex(nextIdx);
  }, [cityIndex, totalCities, changeCityToIndex]);

  // Previous city
  const prevCity = useCallback(() => {
    if (totalCities <= 1) return;
    const prevIdx = (cityIndex - 1 + totalCities) % totalCities;
    changeCityToIndex(prevIdx);
  }, [cityIndex, totalCities, changeCityToIndex]);

  // Pause / Resume handlers on mouse hover
  const pauseRotation = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resumeRotation = useCallback(() => {
    setIsPaused(false);
  }, []);

  // Set up 5-second automatic rotation timer (pauses when user hovers over section)
  useEffect(() => {
    if (totalCities <= 1 || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setCityIndex((prevIdx) => {
        setIsTransitioning(true);
        setTimeout(() => {
          setIsTransitioning(false);
        }, 250);
        return (prevIdx + 1) % totalCities;
      });
    }, rotationIntervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [totalCities, rotationIntervalMs, isPaused]);

  return {
    activeCity,
    activeProperties,
    eligibleCities,
    isTransitioning,
    nextCity,
    prevCity,
    setCityByName,
    cityIndex,
    hasMultipleCities: totalCities > 1,
    pauseRotation,
    resumeRotation,
    isPaused,
  };
}
