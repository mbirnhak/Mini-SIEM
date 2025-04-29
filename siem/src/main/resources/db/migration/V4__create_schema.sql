-- Add password hashing trigger
CREATE OR REPLACE FUNCTION hash_password()
    RETURNS TRIGGER AS $$
BEGIN
    -- Only hash when the password is being set or changed
    IF TG_OP = 'INSERT' OR NEW.password_hash <> OLD.password_hash THEN
        NEW.password_hash = crypt(NEW.password_hash, gen_salt('bf', 10));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER hash_user_password
    BEFORE INSERT OR UPDATE ON "User"
    FOR EACH ROW
EXECUTE FUNCTION hash_password();