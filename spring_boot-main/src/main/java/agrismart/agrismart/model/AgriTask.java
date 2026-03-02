package agrismart.agrismart.model;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.Date;

@Document(collection = "tasks")
@AllArgsConstructor
@NoArgsConstructor
public class AgriTask {
    @Id
    private String id;

    @Field("planId")
    private ObjectId planId;

    @Field("plotId")
    private ObjectId plotId;

    private String title;
    private String description;
    private String type;

    @Field("taskType")
    private String taskType;

    private String parcel;
    private String status;
    private String priority;
    private Date date;

    @Field("dueDate")
    private Date dueDate;

    private String ownerEmail;
    private String assignedTo;

    @Field("assignedToUserId")
    private ObjectId assignedToUserId;

    @Field("notes")
    private String notes;

    private Date createdAt;

    @Field("completedAt")
    private Date completedAt;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public ObjectId getPlanId() {
        return planId;
    }

    public void setPlanId(ObjectId planId) {
        this.planId = planId;
    }

    public ObjectId getPlotId() {
        return plotId;
    }

    public void setPlotId(ObjectId plotId) {
        this.plotId = plotId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getTaskType() {
        return taskType;
    }

    public void setTaskType(String taskType) {
        this.taskType = taskType;
    }

    public String getParcel() {
        return parcel;
    }

    public void setParcel(String parcel) {
        this.parcel = parcel;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }

    public Date getDueDate() {
        return dueDate;
    }

    public void setDueDate(Date dueDate) {
        this.dueDate = dueDate;
    }

    public String getOwnerEmail() {
        return ownerEmail;
    }

    public void setOwnerEmail(String ownerEmail) {
        this.ownerEmail = ownerEmail;
    }

    public String getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(String assignedTo) {
        this.assignedTo = assignedTo;
    }

    public ObjectId getAssignedToUserId() {
        return assignedToUserId;
    }

    public void setAssignedToUserId(ObjectId assignedToUserId) {
        this.assignedToUserId = assignedToUserId;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public Date getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(Date completedAt) {
        this.completedAt = completedAt;
    }
}
