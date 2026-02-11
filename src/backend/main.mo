import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Array "mo:core/Array";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import BlobStorage "blob-storage/Storage";

actor {
  // Include Authorization and Storage mixins
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // User Profile Type (required by instructions)
  public type UserProfile = {
    name : Text;
    email : ?Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public type ApplicantDetails = {
    applicantName : Text;
    fatherName : Text;
    address : Text;
    serviceOpted : Text;
    status : Text; // e.g., "submitted", "pending_documents"
    hasDocuments : Bool;
  };

  module ApplicantDetails {
    public func compare(appDetails1 : ApplicantDetails, appDetails2 : ApplicantDetails) : Order.Order {
      switch (Text.compare(appDetails1.applicantName, appDetails2.applicantName)) {
        case (#equal) { Runtime.trap("Entries with same applicant name not allowed") };
        case (order) { order };
      };
    };
  };

  type ApplicationId = Principal;

  public type ApplicationStatusResponse = {
    applicantDetails : ?ApplicantDetails;
    documents : [BlobStorage.ExternalBlob];
  };

  // Map to store all applications
  let applications = Map.empty<ApplicationId, ApplicantDetails>();

  // Map to store documents per application
  let documents = Map.empty<ApplicationId, [BlobStorage.ExternalBlob]>();

  // User Profile Functions (required by instructions)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Application Functions
  public shared ({ caller }) func submitApplicantDetails(details : ApplicantDetails) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit applications");
    };

    // Save details in applications map (keyed by caller to ensure data isolation)
    let updatedDetails : ApplicantDetails = {
      details with
      status = "submitted";
      hasDocuments = false;
    };
    applications.add(caller, updatedDetails);
  };

  public shared ({ caller }) func uploadApplicationDocuments(files : [BlobStorage.ExternalBlob]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can upload documents");
    };

    // Verify the caller has an application
    switch (applications.get(caller)) {
      case (null) {
        Runtime.trap("Application not found. Submit details first.");
      };
      case (?_details) {
        // Store uploaded files in documents map (keyed by caller for data isolation)
        documents.add(caller, files);

        // Update application to reflect documents uploaded
        let application = switch (applications.get(caller)) {
          case (null) { Runtime.trap("Application not found after all...") };
          case (?app) { app };
        };
        let updatedApplication : ApplicantDetails = {
          application with
          status = "pending_documents";
          hasDocuments = true;
        };
        applications.add(caller, updatedApplication);
      };
    };
  };

  public query ({ caller }) func getApplicationStatus() : async ApplicationStatusResponse {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check application status");
    };

    // Only return caller's own application data (data isolation)
    let applicantDetails = applications.get(caller);
    let userDocuments = documents.get(caller);

    {
      applicantDetails;
      documents = switch (userDocuments) {
        case (null) { [] };
        case (?docs) { docs };
      };
    };
  };

  public query ({ caller }) func getAllApplications() : async [ApplicantDetails] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all applications");
    };

    let values = applications.values().toArray().sort();
    values;
  };

  public shared ({ caller }) func clearDocuments() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can clear documents");
    };

    documents.clear();
  };

  // Admin function to view specific user's application
  public query ({ caller }) func getApplicationByUser(user : Principal) : async ApplicationStatusResponse {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view other users' applications");
    };

    let applicantDetails = applications.get(user);
    let userDocuments = documents.get(user);

    {
      applicantDetails;
      documents = switch (userDocuments) {
        case (null) { [] };
        case (?docs) { docs };
      };
    };
  };
};
