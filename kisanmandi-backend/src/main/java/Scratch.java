import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class Scratch {
    public static void main(String[] args) {
        try {
            Connection conn = DriverManager.getConnection("jdbc:mysql://127.0.0.1:3306/kisanmandi_db", "root", "Kasim@2003");
            Statement stmt = conn.createStatement();
            
            // Problem A: Show rows grouped by source
            java.sql.ResultSet rs = stmt.executeQuery("SELECT source, COUNT(*) AS rows_count, COUNT(DISTINCT market) AS markets, MIN(price_date), MAX(price_date) FROM mandi_prices GROUP BY source");
            System.out.println("--- Mandi Prices Stats ---");
            while (rs.next()) {
                System.out.printf("Source: %s, Rows: %d, Markets: %d, Min Date: %s, Max Date: %s%n",
                    rs.getString(1), rs.getInt(2), rs.getInt(3), rs.getString(4), rs.getString(5));
            }
            rs.close();
            
            // Show last 5 sync logs
            System.out.println("\n--- Last 5 Sync Logs ---");
            rs = stmt.executeQuery("SELECT id, started_at, status, trigger_source, records_fetched, error_message FROM mandi_sync_logs ORDER BY id DESC LIMIT 5");
            while (rs.next()) {
                System.out.printf("ID: %d, Started: %s, Status: %s, Trigger: %s, Fetched: %d, Error: %s%n",
                    rs.getInt(1), rs.getString(2), rs.getString(3), rs.getString(4), rs.getInt(5), rs.getString(6));
            }
            rs.close();

            // Delete fake rows
            int deletedPrices = stmt.executeUpdate("DELETE FROM mandi_prices");
            System.out.println("\nDeleted " + deletedPrices + " prices.");
            int deletedLogs = stmt.executeUpdate("DELETE FROM mandi_sync_logs");
            System.out.println("Deleted " + deletedLogs + " sync logs.");
            
            conn.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
