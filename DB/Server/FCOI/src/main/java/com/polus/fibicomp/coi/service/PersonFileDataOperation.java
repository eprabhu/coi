package com.polus.fibicomp.coi.service;

import java.time.Instant;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate5.HibernateTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.polus.core.filemanagement.FileDataOperation;
import com.polus.core.filemanagement.FileManagementOutputDto;
import com.polus.core.filemanagement.FileStorageException;
import com.polus.fibicomp.coi.pojo.PersonFileData;

@Service(value = "fileDataOperation_6_803")
public class PersonFileDataOperation implements FileDataOperation {

	@Autowired
	private HibernateTemplate hibernateTemplate;

	@Transactional
	@Override
	public void saveFileDetails(FileManagementOutputDto fileManagementOutputDto) {
		try {
			hibernateTemplate.saveOrUpdate(PersonFileData.builder().fileDataId(fileManagementOutputDto.getFileDataId())
					.fileName(fileManagementOutputDto.getFileName()).filePath(fileManagementOutputDto.getFilePath())
					.moduleCode(fileManagementOutputDto.getModuleCode())
					.subModuleCode(fileManagementOutputDto.getSubModuleCode())
					.originalFileName(fileManagementOutputDto.getOriginalFileName()).updateTimeStamp(Instant.now())
					.updateUser(fileManagementOutputDto.getUpdateUser()).data(fileManagementOutputDto.getData())
					.build());
		} catch (Exception e) {
			throw new FileStorageException(
					"Exception in saveFileDetails in DisclFileDataDetailOperation." + e.getMessage());
		}
	}

	@Override
	public FileManagementOutputDto getFileDataDetails(String fileDataId) {
		try {
			PersonFileData fileData = hibernateTemplate.get(PersonFileData.class, fileDataId);
			return FileManagementOutputDto.builder().fileDataId(fileData.getFileDataId()).data(fileData.getData())
					.fileName(fileData.getFileName()).originalFileName(fileData.getOriginalFileName())
					.filePath(fileData.getFilePath()).build();
		} catch (Exception e) {
			throw new FileStorageException(
					"Exception in getFileDataDetails in DisclFileDataDetailOperation." + e.getMessage());
		}
	}

	@Override
	public void deleteFileDataDetails(String fileDataId) {
		try {
			PersonFileData fileData = hibernateTemplate.get(PersonFileData.class, fileDataId);
			hibernateTemplate.delete(fileData);
		} catch (Exception e) {
			throw new FileStorageException(
					"Exception in deleteFileDataDetails in DisclFileDataDetailOperation." + e.getMessage());
		}
	}

	@Override
	public void updateArchiveFlag(String fileDataId, String archiveFlag) {
		try {
			PersonFileData entity = hibernateTemplate.load(PersonFileData.class, fileDataId);
			if (entity != null) {
				entity.setIsArchived(archiveFlag);
				hibernateTemplate.update(entity);
			}
		} catch (Exception e) {
			throw new FileStorageException(
					"Exception in updateArchiveFlag in DisclFileDataDetailOperation." + e.getMessage());
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
