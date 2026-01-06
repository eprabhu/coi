package com.polus.fibicomp.cmp.service;

import java.time.Instant;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate5.HibernateTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.polus.core.filemanagement.FileDataOperation;
import com.polus.core.filemanagement.FileManagementOutputDto;
import com.polus.core.filemanagement.FileStorageException;
import com.polus.fibicomp.cmp.pojo.CoiManagementPlanFileData;

@Service(value = "fileDataOperation_29_0")
public class CoiManagementPlanFileDataOperation implements FileDataOperation{

	@Autowired
	private HibernateTemplate hibernateTemplate;

	@Transactional
	@Override
	public void saveFileDetails(FileManagementOutputDto fileManagementOutputDto) {
		try {
			hibernateTemplate.saveOrUpdate(CoiManagementPlanFileData.builder().fileDataId(fileManagementOutputDto.getFileDataId())
					.fileName(fileManagementOutputDto.getFileName()).filePath(fileManagementOutputDto.getFilePath())
					.originalFileName(fileManagementOutputDto.getOriginalFileName()).updateTimestamp(Instant.now())
					.updatedBy(fileManagementOutputDto.getUpdateUser()).file(fileManagementOutputDto.getData())
					.build());
		} catch (Exception e) {
			throw new FileStorageException(
					"Exception in saveFileDetails in CoiManagementPlanFileDataOperation." + e.getMessage());
		}
	}

	@Override
	public FileManagementOutputDto getFileDataDetails(String fileDataId) {
		try {
			CoiManagementPlanFileData fileData = hibernateTemplate.get(CoiManagementPlanFileData.class, fileDataId);
			return FileManagementOutputDto.builder().fileDataId(fileData.getFileDataId()).data(fileData.getFile())
					.fileName(fileData.getFileName()).originalFileName(fileData.getOriginalFileName())
					.filePath(fileData.getFilePath()).build();
		} catch (Exception e) {
			throw new FileStorageException(
					"Exception in getFileDataDetails in CoiManagementPlanFileDataOperation." + e.getMessage());
		}
	}

	@Override
	public void deleteFileDataDetails(String fileDataId) {
		try {
			CoiManagementPlanFileData fileData = hibernateTemplate.get(CoiManagementPlanFileData.class, fileDataId);
			hibernateTemplate.delete(fileData);
		} catch (Exception e) {
			throw new FileStorageException(
					"Exception in deleteFileDataDetails in CoiManagementPlanFileDataOperation." + e.getMessage());
		}
	}

	@Override
	public void updateArchiveFlag(String fileDataId, String archiveFlag) {
		try {
			CoiManagementPlanFileData entity = hibernateTemplate.load(CoiManagementPlanFileData.class, fileDataId);
			if (entity != null) {
				entity.setIsArchived(archiveFlag);
				hibernateTemplate.update(entity);
			}
		} catch (Exception e) {
			throw new FileStorageException(
					"Exception in updateArchiveFlag in CoiManagementPlanFileDataOperation." + e.getMessage());
		}
	}

	@Override
	public String getFileDirectoryPath(String baseDirectoryPath, String moduleCode, String moduleNumber) {
		return new StringBuilder(baseDirectoryPath).append("/COI/").append(moduleNumber).toString();
	}

	@Override
	public List<FileManagementOutputDto> getMultipleFileDataDetails(List<String> fileDataIds) {
		return null;
	}

}
