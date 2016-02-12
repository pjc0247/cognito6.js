"use strict";

class CognitoDataset
{
  constructor(client, dataset){
    this._client = client;
    this._dataset = dataset;
    console.log(dataset);
  }

  get client() {
    return this._client;
  }
  get dataset() {
    return this._dataset;
  }

  *get(key){
    var _this = this;
    return new Promise(function(resolve, reject){
      _this.dataset.get(key, function(err, value) {
        if(err) reject(err);
        else
          resolve(value);
      });
    });
  }
  *set(key, value){
    var _this = this;
    return new Promise(function(resolve, reject){
      _this.dataset.put(key, value, function(err, value) {
        if(err) reject(err);
        else
          resolve(value);
      });
    });
  }
  *remove(key){
    var _this = this;
    return new Promise(function(resolve, reject){
      _this.dataset.put(key, function(err, value) {
        if(err) reject(err);
        else
          resolve(value);
      });
    });
  }

  *synchronize(){
    var _this = this;
    return new Promise(function(resolve, reject){
      _this.dataset.synchronize({
        onSuccess: function(dataset, newRecords) {
          resolve(newRecords);
        },
        onFailure: function(err) {
          reject(err);
        }
      });
    });
  }

  subscribe(callback){
    var params = {
      IdentityPoolId: this.client.identityPoolId,
      IdentityId: AWS.config.credentials.identityId,
      DatasetName: this.dataset.datasetName,
      DeviceId: AWS.config.credentials.identityId.split(":")[1]
    };

    this.client.rawSync.subscribeToDataset(params, callback);
  }
}
class CognitoClient
{
  static *create(identityPoolId){
    var obj = new CognitoClient();

    obj._identityPoolId = identityPoolId;

    return new Promise(function(resolve, reject){
      AWS.config.credentials.get(function(){
        obj._rawSync = new AWS.CognitoSync();
        obj._sync = new AWS.CognitoSyncManager();
        resolve(obj);
      });
    });
  }
  
  get identityPoolId() {
    return this._identityPoolId;
  }
  get sync() {
    return this._sync;
  }
  get rawSync() {
    return this._rawSync;
  }

  *openDataset(name){
    var _this = this;
    return new Promise(function(resolve, reject){
      _this.sync.openOrCreateDataset(name, function(err, dataset){
        if(err) reject(err);
        else
          resolve(new CognitoDataset(_this, dataset));
      });
    });
  }
  *deleteDataset(name){
    var _this = this;
    var params = {
      IdentityPoolId: this.identityPoolId,
      IdentityId: AWS.config.credentials.identityId,
      DatasetName: name
    };
    
    return new Promise(function(resolve, reject){
      _this.rawSync.deleteDataset(params, function(err, data) {
        if(err) reject(err);
        else
          resolve(data);
      });
    });
  }

  *bulkPublish(){
    var _this = this;
    var params = {
      IdentityPoolId: this.identityPoolId,
    };
    
    return new Promise(function(resolve, reject){
      _this.rawSync.bulkPublish(params, function(err, data) {
        if(err) reject(err);
        else
          resolve(data);
      });
    });
  }
  *listDatasets(){
    var _this = this;
    var params = {
      IdentityPoolId: this.identityPoolId,
      IdentityId: AWS.config.credentials.identityId
    };
    
    return new Promise(function(resolve, reject){
      _this.rawSync.listDatasets(params, function(err, data) {
        if(err) reject(err);
        else
          resolve(data.Datasets);
      });
    });
  }
}