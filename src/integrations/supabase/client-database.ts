import type { Database } from "./types";

// Local contract for the proposed RPC in docs/sql/contact-storage.proposed.sql.
// This does not indicate that it has been installed in the existing project.
export type ClientDatabase = Omit<Database, "public"> & {
  public: Omit<Database["public"], "Functions"> & {
    Functions: Database["public"]["Functions"] & {
      submit_contact_message: {
        Args: {
          p_name: string;
          p_email: string;
          p_phone: string;
          p_subject: string;
          p_message: string;
        };
        Returns: undefined;
      };
    };
  };
};
