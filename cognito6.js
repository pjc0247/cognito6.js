"use strict";

class CognitoDataset
{
  constructor(client, dataset){
    this._client = client;
    this._dataset = dataset;
  }
  
  /**
  * �θ� CognitoClient ��ü�� �����´�.
  */
  get client() {
    return this._client;
  }
  /**
  * raw dataset ��ü�� �����´�.
  */
  get dataset() {
    return this._dataset;
  }
  
  /**
  * ������ Ű�� ��Ī�Ǵ� ���� �����´�.
  */
  *get(key){
    let _this = this;
    return new Promise(function(resolve, reject){
      _this.dataset.get(key, function(err, value) {
        if(err) reject(err);
        else
          resolve(value);
      });
    });
  }
  /**
  * ������ Ű�� ���� �����Ѵ�.
  */
  *set(key, value){
    let _this = this;
    return new Promise(function(resolve, reject){
      _this.dataset.put(key, value, function(err, value) {
        if(err) reject(err);
        else
          resolve(value);
      });
    });
  }
  /**
  * ������ Ű�� ��Ī�Ǵ� ���� �����Ѵ�.
  */
  *remove(key){
    let _this = this;
    return new Promise(function(resolve, reject){
      _this.dataset.put(key, function(err, value) {
        if(err) reject(err);
        else
          resolve(value);
      });
    });
  }
  
  /**
  * ���� �����ͼ��� ����Ʈ�� ����ȭ�Ѵ�.
  */
  *synchronize(){
    let _this = this;
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
    let params = {
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
    let obj = new CognitoClient();

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

  /**
  * ���� Ŭ���̾�Ʈ���� dataset�� �����Ѵ�.
  * ���� ������ �̸��� dataset�� �������� ���� ��� ���� �����ȴ�.
  */
  *openDataset(name){
    let _this = this;
    return new Promise(function(resolve, reject){
      _this.sync.openOrCreateDataset(name, function(err, dataset){
        if(err) reject(err);
        else
          resolve(new CognitoDataset(_this, dataset));
      });
    });
  }
  /**
  * ������ �̸��� dataset�� �����Ѵ�.
  */
  *deleteDataset(name){
    let _this = this;
    let params = {
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
  
  /**
  * ��� dataset�� ��������� �����Ѵ�.
  */
  *bulkPublish(){
    let _this = this;
    let params = {
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
  /**
  * dataset�� ����� �����´�.
  */
  *listDatasets(){
    let _this = this;
    let params = {
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