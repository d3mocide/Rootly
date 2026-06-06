# Seasonal Intelligence Feature Backlog & Status

This document tracks the current state, technical plans, and backlog for the **Seasonal Intelligence** features in Rootly.

## Current State

* **UI Display**: The care screen (both desktop and mobile) currently shows a seasonal nudge: *"Autumn is coming. Tap to see how your watering and fertilizing schedules should adjust for the cooler weather."*
* **Backend Logic**: There is currently **no backend logic** to determine the active season or dynamically calculate watering/fertilizing/pruning adjustments based on species and local season data. The current display is static.

---

## Technical Backlog & Roadmap

### 1. Backend: Seasonal Detection & User Location
* Add support for location-based seasonal calculation (to handle Northern vs. Southern Hemisphere correctly).
* Implement a backend helper that uses either the user's timezone or IP-based location to determine the current month and its corresponding meteorological season.
* Expose a new endpoint: `GET /api/care/season` returning current season metadata.

### 2. Backend: Species-Specific Seasonal Care Adjustments
* Integrate seasonal care recommendation factors into the database schema or fetch them dynamically from PlantBook profiles.
* Calculate adjustment rates:
  * **Watering**: Reduce watering frequency in winter/autumn (e.g., multiply `every` by 1.5x or 2.0x depending on species group).
  * **Fertilizing**: Pause or significantly reduce fertilizing in dormancy phases (late autumn and winter).
  * **Pruning**: Highlight pruning schedules in late winter/early spring active growth prep phases.

### 3. Frontend: Dynamic Seasonal Nudges & Actionable Care Plans
* Replace hardcoded seasonal banners with dynamic alerts fetched from the backend.
* Allow users to apply "Seasonal Care Plan Adjustments" in one click (e.g., dynamically updating watering intervals for all plants in winter).
* Highlight which plants are currently entering dormancy or about to start their active growth season.

### 4. Notifications & Reminders
* Send push or email notifications to alert users when a seasonal change requires adjusting their plant care routines.
