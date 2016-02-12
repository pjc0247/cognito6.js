"use strict";

class CognitoDataset
{
  constructor(client, dataset){
    this._client = client;
    this._dataset = dataset;
  }
  
  /**
  * 부모 CognitoClient 객체를 가져온다.
  */
  get client() {
    return this._client;
  }
  /**
  * raw dataset 객체를 가져온다.
  */
  get dataset() {
    return this._dataset;
  }
  
  /**
  * 지정된 키에 매칭되는 값을 가져온다.
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
  * 지정된 키에 값을 설정한다.
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
  * 지정된 키에 매칭되는 값을 삭제한다.
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
  * 현재 데이터셋을 리모트와 동기화한다.
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
  * 현재 클라이언트에서 dataset을 오픈한다.
  * 만약 지정된 이름의 dataset이 존재하지 않을 경우 새로 생성된다.
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
  * 지정된 이름의 dataset을 삭제한다.
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
  * 모든 dataset의 변경사항을 저장한다.
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
  * dataset의 목록을 가져온다.
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