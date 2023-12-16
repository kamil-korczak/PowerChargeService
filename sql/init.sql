CREATE TABLE IF NOT EXISTS charging_station_type(
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    plug_count INT NOT NULL,
    efficiency FLOAT NOT NULL,
    current_type VARCHAR(2),  -- DC or AC
    PRIMARY KEY(id),
    CONSTRAINT ck_current_type
        CHECK (current_type in ('DC', 'AC')),
    UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS charging_station(
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    device_id UUID NOT NULL,
    charging_station_type_id UUID NOT NULL,
    ip_address INET NOT NULL,
    firmware_version VARCHAR NOT NULL,
    PRIMARY KEY(id),
    CONSTRAINT fk_charging_station_type_id
        FOREIGN KEY(charging_station_type_id)
        REFERENCES charging_station_type(id)
        ON DELETE CASCADE,
    UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS connector(
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    priority BOOLEAN NOT NULL,
    charging_station_id UUID NOT NULL,
    PRIMARY KEY(id),
    CONSTRAINT fk_charging_station_id
        FOREIGN KEY(charging_station_id)
        REFERENCES charging_station(id)
        ON DELETE CASCADE,
    UNIQUE(name, charging_station_id)
);

-- There cannot be more than one connector with priority
CREATE UNIQUE INDEX idx_unique_priority
ON connector (charging_station_id)
WHERE priority;

-- Charging station should have as many connectors as defined in its type in plug_count field
CREATE OR REPLACE FUNCTION check_connector_count()
RETURNS TRIGGER AS $check_connector_count$
    BEGIN
        IF (SELECT COUNT(*) FROM connector c
            WHERE c.charging_station_id = NEW.charging_station_id) >=
            (SELECT plug_count FROM charging_station_type
            WHERE id = (SELECT charging_station_type_id FROM charging_station
                        WHERE id = NEW.charging_station_id)) THEN
            RAISE EXCEPTION 'Exceeded plug_count for charging station type';
        END IF;
        RETURN NEW;
    END;
$check_connector_count$ LANGUAGE plpgsql;


CREATE TRIGGER connector_count_trigger
BEFORE INSERT ON connector
FOR EACH ROW EXECUTE FUNCTION check_connector_count();


/*****************
Insert data
******************/
-- 5 different types of charging station should be defined
INSERT INTO charging_station_type(id, name, plug_count, efficiency, current_type)
VALUES
('883d88a2-39ad-4c67-a640-cfc18f8aaf92', 'SAE Combo CCS (Level 3)', 4, 20, 'DC'),
('2036e373-d9fb-41d6-973f-bf12254d58fd', 'Tesla HPWC (Level 2)', 1, 19, 'AC'),
('8aef036b-8f6c-4e62-ae8b-648ea77dbcf8', 'Tesla Supercharger (Level 3)', 2, 50, 'DC'),
('432cefa8-e508-45ac-a3db-08ad55da108d', 'Port J1772 (Level 2)', 1, 6, 'AC'),
('d0bab973-aaea-45a8-ad4a-41e0ed9f21d0', 'CHAdeMO (Level 3)', 2, 50, 'DC');

INSERT INTO charging_station(id, name, device_id, charging_station_type_id, ip_address, firmware_version)
VALUES
('8e3ebd45-5de0-4858-a529-778c0b6d6c1c', 'Charging Station 1', '54f67a46-1bd3-4894-932b-202080102492', '883d88a2-39ad-4c67-a640-cfc18f8aaf92', '172.0.0.1', 'v1.0.0'),
('7f271a33-7a3c-4d89-ac60-07c10a24c729', 'Charging Station 2', '3f5d68c8-8e1c-45f6-9c2d-a241894018f5', '2036e373-d9fb-41d6-973f-bf12254d58fd', '172.0.0.2', 'v1.0.0'),
('139e6622-1348-4690-806f-88a9202dc9c8', 'Charging Station 3', 'd76a2376-6a15-4e40-ac4d-82ceb59a73f3', '8aef036b-8f6c-4e62-ae8b-648ea77dbcf8', '172.0.0.3', 'v1.0.0'),
('f9f00b53-5e6a-4df2-ab05-a36c15a9eae7', 'Charging Station 4', 'b85ee2b7-f77d-4c75-bca0-e1a59ec8962e', '432cefa8-e508-45ac-a3db-08ad55da108d', '172.0.0.4', 'v1.0.0'),
('d75ebba0-3414-4501-b985-33d00731c170', 'Charging Station 5', '8a677bc5-a94c-43ba-956b-aaa284bb685b', 'd0bab973-aaea-45a8-ad4a-41e0ed9f21d0', '172.0.0.5', 'v1.0.0');

INSERT INTO connector(name, priority, charging_station_id)
VALUES
('Connector #1', True, '8e3ebd45-5de0-4858-a529-778c0b6d6c1c'),
('Connector #2', False, '8e3ebd45-5de0-4858-a529-778c0b6d6c1c'),
('Connector #3', False, '8e3ebd45-5de0-4858-a529-778c0b6d6c1c'),
('Connector #4', False, '8e3ebd45-5de0-4858-a529-778c0b6d6c1c');
