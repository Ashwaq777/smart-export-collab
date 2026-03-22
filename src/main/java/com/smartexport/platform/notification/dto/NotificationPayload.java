package com.smartexport.platform.notification.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class NotificationPayload {
    private String type;
    private String title;
    private String message;
    private Long relatedId;
    private String timestamp;

    public static NotificationPayload matchFound(
            Long matchId, String containerType,
            String location) {
        NotificationPayload p = new NotificationPayload();
        p.setType("MATCH_FOUND");
        p.setTitle("🎯 Correspondance trouvée !");
        p.setMessage("Un conteneur " + containerType
            + " disponible à " + location
            + " correspond à votre demande.");
        p.setRelatedId(matchId);
        p.setTimestamp(
            java.time.LocalDateTime.now().toString());
        return p;
    }

    public static NotificationPayload matchConfirmed(
            Long transactionId) {
        NotificationPayload p = new NotificationPayload();
        p.setType("MATCH_CONFIRMED");
        p.setTitle("✅ Match Confirmé !");
        p.setMessage(
            "Les deux parties ont accepté. "
            + "La transaction est confirmée.");
        p.setRelatedId(transactionId);
        p.setTimestamp(
            java.time.LocalDateTime.now().toString());
        return p;
    }

    public static NotificationPayload workflowUpdate(
            Long transactionId, String status) {
        NotificationPayload p = new NotificationPayload();
        p.setType("WORKFLOW_UPDATE");
        p.setTitle("📦 Statut mis à jour");
        p.setMessage("Le statut de votre transaction "
            + "est maintenant : " + status);
        p.setRelatedId(transactionId);
        p.setTimestamp(
            java.time.LocalDateTime.now().toString());
        return p;
    }
}
