-- ============================
-- EasyFarm Database Schema
-- ============================

-- 1. 식물 테이블
CREATE TABLE plants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  species TEXT NOT NULL,
  location TEXT NOT NULL,
  target_humidity INTEGER NOT NULL DEFAULT 60 CHECK (target_humidity BETWEEN 5 AND 100),
  registered_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 센서 데이터 테이블 (실시간 + 히스토리)
CREATE TABLE sensor_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_id UUID NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
  temperature INTEGER NOT NULL,
  humidity INTEGER NOT NULL,
  soil_moisture INTEGER NOT NULL,
  led_state BOOLEAN NOT NULL DEFAULT false,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 알림 로그 테이블
CREATE TABLE alert_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_id UUID NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('auto_watering', 'low_humidity', 'high_temperature', 'led_on', 'led_off')),
  message TEXT NOT NULL,
  resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 인덱스 (조회 성능)
CREATE INDEX idx_sensor_data_plant_id ON sensor_data(plant_id);
CREATE INDEX idx_sensor_data_recorded_at ON sensor_data(recorded_at DESC);
CREATE INDEX idx_alert_logs_plant_id ON alert_logs(plant_id);
CREATE INDEX idx_alert_logs_created_at ON alert_logs(created_at DESC);

-- 5. 식물별 최신 센서 데이터 뷰
CREATE VIEW latest_sensor_per_plant AS
SELECT DISTINCT ON (plant_id)
  plant_id,
  temperature,
  humidity,
  soil_moisture,
  led_state,
  recorded_at
FROM sensor_data
ORDER BY plant_id, recorded_at DESC;

-- 6. 식물 + 최신 센서 + 상태 계산 뷰
CREATE VIEW plants_with_status AS
SELECT
  p.id,
  p.name,
  p.species,
  p.location,
  p.target_humidity,
  p.registered_at,
  p.created_at,
  s.temperature,
  s.humidity,
  s.soil_moisture,
  s.led_state,
  s.recorded_at AS sensor_updated_at,
  CASE
    WHEN s.soil_moisture IS NULL THEN 'normal'
    WHEN s.soil_moisture < (p.target_humidity * 0.5) OR s.temperature > 35 THEN 'danger'
    WHEN s.soil_moisture < (p.target_humidity * 0.8) OR s.temperature > 30 THEN 'warning'
    ELSE 'normal'
  END AS status
FROM plants p
LEFT JOIN latest_sensor_per_plant s ON s.plant_id = p.id;