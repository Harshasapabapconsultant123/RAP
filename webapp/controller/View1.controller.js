sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox"
], (Controller, JSONModel, MessageBox) => {
    "use strict";

    return Controller.extend("gangmaintainance.controller.View1", {
        onInit: function () {
            var editableModel = new JSONModel({
                editable: false,
                textvisible: true,
                inputvisible: false,  // Initially, the table will be non-editable
                results: [],
                selectedGang: {}
            });
            this.getView().setModel(editableModel, "gang");
            this.getView().setModel(editableModel, "edit");

            this.readFun();
            var model2 = new JSONModel();
            this.getView().setModel(model2, "fgang");
        },

        readFun: function () {
            var that = this;
            var sQuery = this.getOwnerComponent().getModel();
            sQuery.read("/gangSet", {
                success: function (odata) {
                    odata.results.forEach(function (data) {
                        data["inputvisible"] = false;
                        data["textvisible"] = true;
                    });

                    var loModel = new JSONModel(odata);
                    that.getView().setModel(loModel, "gang");

                    // Apply sorting after data is set in the model
                    var oTable = that.byId("tableid");
                    var oBinding = oTable.getBinding("items");

                    if (oBinding) {
                        oBinding.sort(new sap.ui.model.Sorter("Description", false)); // false = ascending
                    }
                },
                error: function (oError) {
                    MessageBox.error("Error loading data.");
                }
            });
        },

        onpress: function (oEvent) {
            var that = this;
            var oContext = oEvent.getSource().getBindingContext("gang");
            var sPath = oContext.getPath().split("/")[2];
            var sTextVisiblePath = "/results/" + sPath + "/textvisible";
            var sInputVisiblePath = "/results/" + sPath + "/inputvisible";
            var oModel = this.getView().getModel("gang");
            oModel.setProperty(sTextVisiblePath, false);
            oModel.setProperty(sInputVisiblePath, true);

            var sDataPath = "/results/" + sPath;
            var oRowData = oModel.getProperty(sDataPath);
            if (!oRowData.__originalData) {
                oModel.setProperty(sDataPath + "/__originalData", JSON.parse(JSON.stringify(oRowData)));
            }
        },

        // oncreate: function () {
        //     var oModel = this.getView().getModel("fgang");

        //     var desid = oModel.getProperty("/Gangid");
        //     var oNewGang = oModel.getProperty("/Description");
        //     var oAssignedsupervisor = oModel.getProperty("/Assignedsupervisor");
        //     var oDivisionengineer = oModel.getProperty("/Divisionengineer");
        //     var oCity = oModel.getProperty("/City");
        //     var oState = oModel.getProperty("/State");
        //     var oDivision = oModel.getProperty("/Division");
        //     var oPositionn = oModel.getProperty("/Positionn");
        //     if (oNewGang === undefined) {
        //         oNewGang = 'gang Description'
        //     }
        //     // Basic validation
        //     if (oNewGang !== undefined && oNewGang !== "" && desid !== undefined && desid !== "") {
        //         var that = this;
        //         var oGetModel = this.getView().getModel("fgang").getData();
        //         var sQuery = this.getOwnerComponent().getModel();
        //         sQuery.create("/gangSet", oGetModel,
        //             {
        //                 success: function (crud) {
        //                     sap.m.MessageBox.success("Gang ID " + oGetModel.Gangid + " created successfully");

        //                     that.readFun();
        //                 },
        //                 error: function (crud) {
        //                     sap.m.MessageBox.error("Error While Creating Record");

        //                 }
        //             }
        //         );


        //     }
        //     else {
        //         sap.m.MessageBox.error("Please Fill..." + oNewGang + "...  mandatory  ");

        //     }
        // },
        oncreate: function () {
            var oModel = this.getView().getModel("fgang");
            var oData = oModel.getData();
        
            // Array of required fields with user-friendly labels
            var requiredFields = [
                { path: "Gangid", label: "Gang ID" },
                { path: "Description", label: "Description" },
                { path: "Assignedsupervisor", label: "Assigned Supervisor" },
                { path: "Divisionengineer", label: "Division Engineer" },
                { path: "City", label: "City" },
                { path: "State", label: "Region (State)" },
                { path: "Division", label: "Division" },
                { path: "Positionn", label: "Position" }
            ];
        
            var missingFields = [];
        
            // Use for loop to check for missing fields
            for (var i = 0; i < requiredFields.length; i++) {
                var field = requiredFields[i];
                var value = oData[field.path];
        
                if (!value || value.trim() === "") {
                    missingFields.push(field.label);
                }
            }
        
            // Show warning if fields are missing
            if (missingFields.length > 0) {
                var msg = "Please enter the following mandatory fields:\n• " + missingFields.join("\n• ");
                sap.m.MessageBox.warning(msg);
                return;
            }
        
            // All fields are valid — create the record
            var that = this;
            var sQuery = this.getOwnerComponent().getModel();
        
            sQuery.create("/gangSet", oData, {
                success: function (crud) {
                    sap.m.MessageBox.success("Gang ID " + oData.Gangid + " created successfully");
                    that.readFun();
                },
                error: function (crud) {
                    sap.m.MessageBox.error("Error While Creating Record");
                }
            });
        },
        
        

        onsc: function (oEVent) {
            var selected = oEVent.getSource().getSelectedKey();
        },



        onsave: function () {
            var that = this;
            var oModelData = this.getView().getModel("gang").getData();
            var oODataModel = this.getOwnerComponent().getModel();
            var isAnyUpdated = false;

            oModelData.results.forEach(function (item) {
                if (item.inputvisible) {
                    var originalData = item.__originalData;

                    if (!originalData) {
                        sap.m.MessageToast.show("Original data not found for Gang ID " + item.Gangid);
                        return;
                    }

                    var oUpdateData = Object.assign({}, item);
                    delete oUpdateData.inputvisible;
                    delete oUpdateData.textvisible;
                    delete oUpdateData.__originalData;

                    var oOriginalClean = Object.assign({}, originalData);
                    delete oOriginalClean.inputvisible;
                    delete oOriginalClean.textvisible;
                    delete oOriginalClean.__originalData;

                    var isModified = Object.keys(oUpdateData).some(function (key) {
                        var current = oUpdateData[key] != null ? String(oUpdateData[key]) : "";
                        var original = oOriginalClean[key] != null ? String(oOriginalClean[key]) : "";
                        return current !== original;
                    });

                    if (isModified) {
                        isAnyUpdated = true;
                        oODataModel.update("/gangSet('" + item.Gangid + "')", oUpdateData, {
                            success: function () {
                                sap.m.MessageToast.show("Gang ID " + item.Gangid + " updated successfully");
                                that.readFun();
                            },
                            error: function () {
                                sap.m.MessageToast.show("Update failed for Gang ID " + item.Gangid);
                            }
                        });
                    }
                }
            });

            if (!isAnyUpdated) {
                sap.m.MessageBox.warning("No changes detected. Nothing was updated.");
            }
        }


    });
});