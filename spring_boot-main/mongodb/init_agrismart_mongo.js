/*
  AgriSmart MongoDB bootstrap script
  - Creates collections
  - Applies JSON schema validators
  - Creates indexes (unique + performance)
  - Seeds base roles

  Run:
    mongosh "mongodb://localhost:27017" "c:/Users/Mega-PC/Desktop/Work/4eme/PI/agrismart/mongodb/init_agrismart_mongo.js"
*/

const dbName = "agrismart";
const targetDb = db.getSiblingDB(dbName);

function ensureCollection(name, validator) {
  const exists = targetDb.getCollectionNames().includes(name);
  if (!exists) {
    targetDb.createCollection(name, {
      validator,
      validationLevel: "moderate",
      validationAction: "error"
    });
    print(`Created collection: ${name}`);
  } else {
    targetDb.runCommand({
      collMod: name,
      validator,
      validationLevel: "moderate",
      validationAction: "error"
    });
    print(`Updated validator: ${name}`);
  }
}

function ensureIndex(colName, indexSpec, options = {}) {
  targetDb.getCollection(colName).createIndex(indexSpec, options);
}

function objectSchema(required, properties) {
  return {
    $jsonSchema: {
      bsonType: "object",
      required,
      properties
    }
  };
}

const F = {
  oid: { bsonType: "objectId" },
  str: { bsonType: "string" },
  num: { bsonType: ["int", "long", "double", "decimal"] },
  bool: { bsonType: "bool" },
  date: { bsonType: "date" },
  arr: { bsonType: "array" },
  obj: { bsonType: "object" }
};

// 1) AUTH / USERS
ensureCollection("users", objectSchema(
  ["email", "passwordHash", "firstName", "lastName", "roleId", "status", "createdAt"],
  {
    email: F.str,
    passwordHash: F.str,
    firstName: F.str,
    lastName: F.str,
    phone: F.str,
    roleId: F.oid,
    accountType: F.str,
    isClientApproved: F.bool,
    organization: F.str,
    language: F.str,
    status: F.str,
    profilePictureUrl: F.str,
    lastLoginAt: F.date,
    createdAt: F.date,
    updatedAt: F.date
  }
));
ensureIndex("users", { email: 1 }, { unique: true, name: "ux_users_email" });
ensureIndex("users", { roleId: 1, status: 1 }, { name: "ix_users_role_status" });

ensureCollection("roles", objectSchema(
  ["name", "description", "createdAt"],
  { name: F.str, description: F.str, createdAt: F.date }
));
ensureIndex("roles", { name: 1 }, { unique: true, name: "ux_roles_name" });

ensureCollection("permissions", objectSchema(
  ["code", "label", "module", "action", "createdAt"],
  { code: F.str, label: F.str, module: F.str, action: F.str, createdAt: F.date }
));
ensureIndex("permissions", { code: 1 }, { unique: true, name: "ux_permissions_code" });

ensureCollection("rolePermissions", objectSchema(
  ["roleId", "permissionId"],
  { roleId: F.oid, permissionId: F.oid }
));
ensureIndex("rolePermissions", { roleId: 1, permissionId: 1 }, { unique: true, name: "ux_role_permissions" });

ensureCollection("userSessions", objectSchema(
  ["userId", "refreshTokenHash", "expiresAt", "createdAt"],
  { userId: F.oid, refreshTokenHash: F.str, deviceInfo: F.str, ipAddress: F.str, expiresAt: F.date, revokedAt: F.date, createdAt: F.date }
));
ensureIndex("userSessions", { userId: 1, expiresAt: -1 }, { name: "ix_user_sessions_user_exp" });

ensureCollection("signupRequests", objectSchema(
  ["email", "fullName", "requestedRole", "status", "createdAt"],
  { email: F.str, fullName: F.str, requestedRole: F.str, organization: F.str, status: F.str, reviewedBy: F.oid, reviewedAt: F.date, createdAt: F.date }
));
ensureIndex("signupRequests", { email: 1, status: 1 }, { name: "ix_signup_requests_email_status" });

ensureCollection("roleUpgradeRequests", objectSchema(
  ["userId", "requestedRole", "status", "createdAt"],
  { userId: F.oid, requestedRole: F.str, reason: F.str, status: F.str, reviewedBy: F.oid, reviewedAt: F.date, createdAt: F.date }
));
ensureIndex("roleUpgradeRequests", { userId: 1, status: 1 }, { name: "ix_role_upgrade_user_status" });

// 2) FARM MANAGEMENT
ensureCollection("farms", objectSchema(
  ["ownerUserId", "name", "totalAreaHa", "createdAt"],
  {
    ownerUserId: F.oid,
    name: F.str,
    locationText: F.str,
    latitude: F.num,
    longitude: F.num,
    totalAreaHa: F.num,
    soilType: F.str,
    climateZone: F.str,
    waterSource: F.str,
    createdAt: F.date,
    updatedAt: F.date
  }
));
ensureIndex("farms", { ownerUserId: 1 }, { name: "ix_farms_owner" });

ensureCollection("plots", objectSchema(
  ["farmId", "name", "sizeHa", "status", "lastUpdatedAt"],
  { farmId: F.oid, name: F.str, sizeHa: F.num, soilPh: F.num, irrigationType: F.str, status: F.str, currentCropId: F.oid, lastUpdatedAt: F.date }
));
ensureIndex("plots", { farmId: 1 }, { name: "ix_plots_farm" });

ensureCollection("crops", objectSchema(
  ["name", "category", "growingPeriodDays", "waterNeedsLevel", "createdAt"],
  { name: F.str, category: F.str, season: F.str, growingPeriodDays: F.num, waterNeedsLevel: F.str, recommendedSoil: F.str, createdAt: F.date }
));
ensureIndex("crops", { name: 1 }, { unique: true, name: "ux_crops_name" });

ensureCollection("cropCycles", objectSchema(
  ["plotId", "cropId", "seasonYear", "status", "createdAt"],
  { plotId: F.oid, cropId: F.oid, seasonYear: F.str, sowingDate: F.date, expectedHarvestDate: F.date, actualHarvestDate: F.date, status: F.str, yieldQty: F.num, yieldUnit: F.str, createdAt: F.date }
));
ensureIndex("cropCycles", { plotId: 1, seasonYear: 1 }, { name: "ix_crop_cycles_plot_season" });

// 3) MARKETPLACE
ensureCollection("products", objectSchema(
  ["sellerUserId", "name", "unit", "unitPrice", "stockQty", "status", "createdAt"],
  { sellerUserId: F.oid, farmId: F.oid, name: F.str, category: F.str, description: F.str, unit: F.str, unitPrice: F.num, stockQty: F.num, status: F.str, createdAt: F.date, updatedAt: F.date }
));
ensureIndex("products", { sellerUserId: 1, status: 1 }, { name: "ix_products_seller_status" });
ensureIndex("products", { category: 1, name: 1 }, { name: "ix_products_category_name" });

ensureCollection("productImages", objectSchema(
  ["productId", "imageUrl", "createdAt"],
  { productId: F.oid, imageUrl: F.str, sortOrder: F.num, createdAt: F.date }
));
ensureIndex("productImages", { productId: 1, sortOrder: 1 }, { name: "ix_product_images_product_order" });

ensureCollection("orders", objectSchema(
  ["buyerUserId", "sellerUserId", "orderNumber", "status", "totalAmount", "createdAt"],
  { buyerUserId: F.oid, sellerUserId: F.oid, orderNumber: F.str, status: F.str, subtotal: F.num, deliveryFee: F.num, totalAmount: F.num, currency: F.str, deliveryAddress: F.str, createdAt: F.date, updatedAt: F.date }
));
ensureIndex("orders", { orderNumber: 1 }, { unique: true, name: "ux_orders_number" });
ensureIndex("orders", { buyerUserId: 1, createdAt: -1 }, { name: "ix_orders_buyer_created" });
ensureIndex("orders", { sellerUserId: 1, createdAt: -1 }, { name: "ix_orders_seller_created" });

ensureCollection("orderItems", objectSchema(
  ["orderId", "productId", "quantity", "unitPriceSnapshot", "lineTotal"],
  { orderId: F.oid, productId: F.oid, productNameSnapshot: F.str, quantity: F.num, unitPriceSnapshot: F.num, lineTotal: F.num }
));
ensureIndex("orderItems", { orderId: 1 }, { name: "ix_order_items_order" });

ensureCollection("payments", objectSchema(
  ["orderId", "method", "amount", "status", "createdAt"],
  { orderId: F.oid, method: F.str, provider: F.str, providerRef: F.str, amount: F.num, status: F.str, paidAt: F.date, createdAt: F.date }
));
ensureIndex("payments", { orderId: 1 }, { name: "ix_payments_order" });

ensureCollection("marketPrices", objectSchema(
  ["marketName", "region", "avgPrice", "priceDate"],
  { cropId: F.oid, marketName: F.str, region: F.str, minPrice: F.num, maxPrice: F.num, avgPrice: F.num, priceDate: F.date, source: F.str }
));
ensureIndex("marketPrices", { cropId: 1, priceDate: -1 }, { name: "ix_market_prices_crop_date" });

// 4) E-LEARNING
ensureCollection("courses", objectSchema(
  ["title", "category", "level", "language", "published", "createdBy", "createdAt"],
  { title: F.str, description: F.str, category: F.str, level: F.str, language: F.str, durationMinutes: F.num, published: F.bool, createdBy: F.oid, createdAt: F.date, updatedAt: F.date }
));
ensureIndex("courses", { category: 1, published: 1 }, { name: "ix_courses_category_published" });

ensureCollection("courseModules", objectSchema(
  ["courseId", "title", "type", "orderIndex", "createdAt"],
  { courseId: F.oid, title: F.str, type: F.str, contentUrl: F.str, durationMinutes: F.num, orderIndex: F.num, createdAt: F.date }
));
ensureIndex("courseModules", { courseId: 1, orderIndex: 1 }, { name: "ix_course_modules_course_order" });

ensureCollection("enrollments", objectSchema(
  ["userId", "courseId", "status", "progressPercent", "enrolledAt"],
  { userId: F.oid, courseId: F.oid, status: F.str, progressPercent: F.num, score: F.num, enrolledAt: F.date, completedAt: F.date }
));
ensureIndex("enrollments", { userId: 1, courseId: 1 }, { unique: true, name: "ux_enrollments_user_course" });

ensureCollection("moduleProgress", objectSchema(
  ["enrollmentId", "moduleId", "isCompleted", "lastSeenAt"],
  { enrollmentId: F.oid, moduleId: F.oid, isCompleted: F.bool, watchedSeconds: F.num, score: F.num, lastSeenAt: F.date }
));
ensureIndex("moduleProgress", { enrollmentId: 1, moduleId: 1 }, { unique: true, name: "ux_module_progress_enrollment_module" });

ensureCollection("learningResources", objectSchema(
  ["title", "resourceType", "url", "language", "createdBy", "createdAt"],
  { title: F.str, resourceType: F.str, url: F.str, tags: F.str, language: F.str, createdBy: F.oid, createdAt: F.date }
));

// 5) PLANNING
ensureCollection("plans", objectSchema(
  ["ownerUserId", "title", "startDate", "endDate", "status", "createdAt"],
  { ownerUserId: F.oid, farmId: F.oid, title: F.str, description: F.str, startDate: F.date, endDate: F.date, status: F.str, createdAt: F.date, updatedAt: F.date }
));
ensureIndex("plans", { ownerUserId: 1, startDate: -1 }, { name: "ix_plans_owner_start" });

ensureCollection("tasks", objectSchema(
  ["planId", "title", "priority", "dueDate", "status", "createdAt"],
  { planId: F.oid, plotId: F.oid, title: F.str, taskType: F.str, priority: F.str, dueDate: F.date, assignedToUserId: F.oid, status: F.str, notes: F.str, createdAt: F.date, completedAt: F.date }
));
ensureIndex("tasks", { planId: 1, dueDate: 1 }, { name: "ix_tasks_plan_due" });
ensureIndex("tasks", { assignedToUserId: 1, status: 1 }, { name: "ix_tasks_assignee_status" });

ensureCollection("taskNotifications", objectSchema(
  ["taskId", "userId", "channel", "scheduledAt", "status"],
  { taskId: F.oid, userId: F.oid, channel: F.str, scheduledAt: F.date, sentAt: F.date, status: F.str }
));
ensureIndex("taskNotifications", { userId: 1, scheduledAt: 1 }, { name: "ix_task_notifications_user_time" });

// 6) COOPERATIVES
ensureCollection("cooperatives", objectSchema(
  ["name", "region", "createdBy", "createdAt"],
  { name: F.str, registrationNumber: F.str, region: F.str, contactEmail: F.str, contactPhone: F.str, createdBy: F.oid, createdAt: F.date }
));
ensureIndex("cooperatives", { name: 1 }, { unique: true, name: "ux_cooperatives_name" });

ensureCollection("cooperativeMembers", objectSchema(
  ["cooperativeId", "userId", "memberRole", "status", "joinedAt"],
  { cooperativeId: F.oid, userId: F.oid, memberRole: F.str, status: F.str, joinedAt: F.date }
));
ensureIndex("cooperativeMembers", { cooperativeId: 1, userId: 1 }, { unique: true, name: "ux_coop_members_unique" });

ensureCollection("cooperativePlans", objectSchema(
  ["cooperativeId", "title", "periodStart", "periodEnd", "status", "createdAt"],
  { cooperativeId: F.oid, title: F.str, periodStart: F.date, periodEnd: F.date, status: F.str, createdAt: F.date }
));

ensureCollection("cooperativeReports", objectSchema(
  ["cooperativeId", "title", "reportPeriod", "generatedAt", "generatedBy"],
  { cooperativeId: F.oid, title: F.str, reportPeriod: F.str, kpiJson: F.str, fileUrl: F.str, generatedAt: F.date, generatedBy: F.oid }
));

// 7) IOT
ensureCollection("devices", objectSchema(
  ["farmId", "deviceCode", "name", "deviceType", "status", "createdAt"],
  { farmId: F.oid, deviceCode: F.str, name: F.str, deviceType: F.str, firmwareVersion: F.str, status: F.str, batteryLevel: F.num, lastSeenAt: F.date, createdAt: F.date }
));
ensureIndex("devices", { deviceCode: 1 }, { unique: true, name: "ux_devices_code" });
ensureIndex("devices", { farmId: 1, status: 1 }, { name: "ix_devices_farm_status" });

ensureCollection("sensors", objectSchema(
  ["deviceId", "sensorType", "unit", "status"],
  { deviceId: F.oid, sensorType: F.str, unit: F.str, minThreshold: F.num, maxThreshold: F.num, status: F.str, calibratedAt: F.date }
));
ensureIndex("sensors", { deviceId: 1, sensorType: 1 }, { name: "ix_sensors_device_type" });

ensureCollection("sensorReadings", objectSchema(
  ["sensorId", "value", "recordedAt"],
  { sensorId: F.oid, value: F.num, recordedAt: F.date, qualityFlag: F.str, source: F.str }
));
ensureIndex("sensorReadings", { sensorId: 1, recordedAt: -1 }, { name: "ix_sensor_readings_sensor_time" });

ensureCollection("deviceAlerts", objectSchema(
  ["deviceId", "alertType", "severity", "message", "status", "triggeredAt"],
  { deviceId: F.oid, sensorId: F.oid, farmId: F.oid, plotId: F.oid, alertType: F.str, severity: F.str, message: F.str, status: F.str, triggeredAt: F.date, acknowledgedBy: F.oid, acknowledgedAt: F.date, resolvedAt: F.date }
));
ensureIndex("deviceAlerts", { farmId: 1, status: 1, triggeredAt: -1 }, { name: "ix_device_alerts_farm_status_time" });

ensureCollection("diseaseDetections", objectSchema(
  ["farmId", "imageUrl", "detectedDisease", "confidence", "createdAt"],
  { deviceId: F.oid, farmId: F.oid, plotId: F.oid, cropId: F.oid, imageUrl: F.str, detectedDisease: F.str, confidence: F.num, recommendationText: F.str, createdAt: F.date }
));
ensureIndex("diseaseDetections", { farmId: 1, createdAt: -1 }, { name: "ix_disease_detections_farm_time" });

// 8) SUPPORT / AI
ensureCollection("supportTickets", objectSchema(
  ["createdByUserId", "category", "subject", "priority", "status", "createdAt"],
  { createdByUserId: F.oid, category: F.str, subject: F.str, description: F.str, priority: F.str, status: F.str, assignedToUserId: F.oid, createdAt: F.date, closedAt: F.date }
));
ensureIndex("supportTickets", { createdByUserId: 1, createdAt: -1 }, { name: "ix_support_tickets_creator_time" });

ensureCollection("ticketMessages", objectSchema(
  ["ticketId", "authorUserId", "message", "createdAt"],
  { ticketId: F.oid, authorUserId: F.oid, message: F.str, attachmentUrl: F.str, createdAt: F.date }
));
ensureIndex("ticketMessages", { ticketId: 1, createdAt: 1 }, { name: "ix_ticket_messages_ticket_time" });

ensureCollection("aiDiagnoses", objectSchema(
  ["userId", "inputImageUrl", "diagnosisLabel", "confidence", "createdAt"],
  { userId: F.oid, farmId: F.oid, plotId: F.oid, cropId: F.oid, inputImageUrl: F.str, diagnosisLabel: F.str, confidence: F.num, recommendationText: F.str, modelVersion: F.str, createdAt: F.date }
));
ensureIndex("aiDiagnoses", { userId: 1, createdAt: -1 }, { name: "ix_ai_diagnoses_user_time" });

ensureCollection("yieldPredictions", objectSchema(
  ["farmId", "cropId", "seasonYear", "predictedYield", "createdAt"],
  { farmId: F.oid, plotId: F.oid, cropId: F.oid, seasonYear: F.str, predictedYield: F.num, unit: F.str, confidence: F.num, featuresJson: F.str, modelVersion: F.str, createdAt: F.date }
));
ensureIndex("yieldPredictions", { farmId: 1, seasonYear: 1, cropId: 1 }, { name: "ix_yield_predictions_scope" });

// 9) REPORTING
ensureCollection("reports", objectSchema(
  ["ownerUserId", "reportType", "periodStart", "periodEnd", "createdAt"],
  { ownerUserId: F.oid, farmId: F.oid, reportType: F.str, periodStart: F.date, periodEnd: F.date, payloadJson: F.str, fileUrl: F.str, createdAt: F.date }
));
ensureIndex("reports", { ownerUserId: 1, createdAt: -1 }, { name: "ix_reports_owner_time" });

ensureCollection("kpis", objectSchema(
  ["scopeType", "scopeId", "name", "value", "period", "calculatedAt"],
  { scopeType: F.str, scopeId: F.oid, name: F.str, value: F.num, unit: F.str, period: F.str, calculatedAt: F.date }
));
ensureIndex("kpis", { scopeType: 1, scopeId: 1, period: 1 }, { name: "ix_kpis_scope_period" });

ensureCollection("dashboards", objectSchema(
  ["userId", "name", "layoutJson", "isDefault", "createdAt"],
  { userId: F.oid, name: F.str, layoutJson: F.str, filtersJson: F.str, isDefault: F.bool, createdAt: F.date, updatedAt: F.date }
));
ensureIndex("dashboards", { userId: 1, isDefault: -1 }, { name: "ix_dashboards_user_default" });

// 10) NOTIFICATIONS / CHAT
ensureCollection("notifications", objectSchema(
  ["userId", "type", "title", "message", "isRead", "createdAt"],
  { userId: F.oid, type: F.str, title: F.str, message: F.str, payloadJson: F.str, isRead: F.bool, createdAt: F.date, readAt: F.date }
));
ensureIndex("notifications", { userId: 1, isRead: 1, createdAt: -1 }, { name: "ix_notifications_user_read_time" });

ensureCollection("conversations", objectSchema(
  ["type", "createdBy", "createdAt"],
  { type: F.str, createdBy: F.oid, createdAt: F.date }
));

ensureCollection("conversationParticipants", objectSchema(
  ["conversationId", "userId", "joinedAt"],
  { conversationId: F.oid, userId: F.oid, joinedAt: F.date }
));
ensureIndex("conversationParticipants", { conversationId: 1, userId: 1 }, { unique: true, name: "ux_conversation_participants" });

ensureCollection("messages", objectSchema(
  ["conversationId", "senderUserId", "content", "sentAt"],
  { conversationId: F.oid, senderUserId: F.oid, content: F.str, attachmentUrl: F.str, sentAt: F.date, readAt: F.date }
));
ensureIndex("messages", { conversationId: 1, sentAt: 1 }, { name: "ix_messages_conversation_time" });

// 11) ADMIN
ensureCollection("auditLogs", objectSchema(
  ["actorUserId", "action", "resourceType", "createdAt"],
  { actorUserId: F.oid, action: F.str, resourceType: F.str, resourceId: F.oid, beforeJson: F.str, afterJson: F.str, ipAddress: F.str, createdAt: F.date }
));
ensureIndex("auditLogs", { actorUserId: 1, createdAt: -1 }, { name: "ix_audit_logs_actor_time" });

ensureCollection("systemConfigs", objectSchema(
  ["configKey", "configValue", "updatedAt"],
  { configKey: F.str, configValue: F.str, description: F.str, updatedBy: F.oid, updatedAt: F.date }
));
ensureIndex("systemConfigs", { configKey: 1 }, { unique: true, name: "ux_system_configs_key" });

ensureCollection("fileStorage", objectSchema(
  ["ownerUserId", "module", "fileName", "mimeType", "sizeBytes", "storageUrl", "createdAt"],
  { ownerUserId: F.oid, module: F.str, fileName: F.str, mimeType: F.str, sizeBytes: F.num, storageUrl: F.str, createdAt: F.date }
));
ensureIndex("fileStorage", { ownerUserId: 1, createdAt: -1 }, { name: "ix_file_storage_owner_time" });

// Seed roles
const roles = [
  { name: "BUYER", description: "Marketplace buyer" },
  { name: "PRODUCTEUR", description: "Farmer/producer" },
  { name: "TECHNICIEN", description: "Agricultural technician" },
  { name: "COOPERATIVE", description: "Cooperative user" },
  { name: "ONG", description: "NGO user" },
  { name: "ETAT", description: "State actor" },
  { name: "ADMIN", description: "Platform administrator" }
];

roles.forEach((r) => {
  targetDb.roles.updateOne(
    { name: r.name },
    { $setOnInsert: { ...r, createdAt: new Date() } },
    { upsert: true }
  );
});

print("AgriSmart MongoDB initialization completed successfully.");
print(`Database: ${dbName}`);
